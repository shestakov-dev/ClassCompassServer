import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
} from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { KratosService } from "@resources/ory/kratos/kratos.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => SchoolsService))
		private readonly schoolsService: SchoolsService,
		private readonly kratosService: KratosService,
		private readonly ketoService: KetoService
	) {}

	async create(createUserDto: CreateUserDto) {
		await this.schoolsService.ensureExists(createUserDto.schoolId);

		// Create an identity for the user in Ory Kratos
		const kratosIdentity = await this.kratosService.createIdentity({
			email: createUserDto.email,
			firstName: createUserDto.firstName,
			lastName: createUserDto.lastName,
		});

		const newUser = await this.prisma.client.user.create({
			data: {
				...createUserDto,
				identityId: kratosIdentity.id,
			},
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		// Add parent school relationship
		await this.addParentSchool(newUser.id, createUserDto.schoolId);

		// Add the user as a member of the school
		await this.addMemberToSchool(createUserDto.schoolId, kratosIdentity.id);

		return newUser;
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.user.findMany({
			where: { schoolId },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});
	}

	async findAllByIdentityIds(identityIds: string[]) {
		return this.prisma.client.user.findMany({
			where: {
				identityId: {
					in: identityIds,
				},
			},
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});
	}

	findOne(id: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { id },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});
	}

	async findByIdentityId(identityId: string, callerIdentityId: string) {
		const user = await this.prisma.client.user.findUniqueOrThrow({
			where: { identityId },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		const isAuthorized = await this.ketoService.checkPermission({
			namespace: KetoNamespace.User,
			object: user.id,
			relation: "view",
			subjectId: callerIdentityId,
		});

		if (!isAuthorized) {
			throw new ForbiddenException(
				"User does not have permission to view this user"
			);
		}

		return user;
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		if (updateUserDto.schoolId) {
			await this.schoolsService.ensureExists(updateUserDto.schoolId);
		}

		const updatedUser = await this.prisma.client.user.update({
			where: { id },
			data: updateUserDto,
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		await this.kratosService.updateIdentity(updatedUser.identityId, {
			email: updatedUser.email,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
		});

		return updatedUser;
	}

	async remove(id: string) {
		const removedUser = await this.prisma.client.user.delete({
			where: { id },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		// Remove the identity from Ory Kratos
		await this.kratosService.deleteIdentity(removedUser.identityId);

		// Remove parent school relationship
		await this.removeParentSchool(removedUser.id, removedUser.schoolId);

		// Remove the user from the school members/admins
		await this.removeMemberFromSchool(
			removedUser.schoolId,
			removedUser.identityId
		);

		await this.removeAdminFromSchool(
			removedUser.schoolId,
			removedUser.identityId
		);

		return removedUser;
	}

	async ensureExists(id: string) {
		await this.prisma.client.user.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.user.ensureExistsMany(ids);
	}

	private async addParentSchool(userId: string, schoolId: string) {
		await this.ketoService.linkChild(KetoNamespace.User, userId, schoolId);
	}

	private async removeParentSchool(userId: string, schoolId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.User,
			userId,
			schoolId
		);
	}

	private async addMemberToSchool(schoolId: string, identityId: string) {
		await this.ketoService.createRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async removeMemberFromSchool(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async removeAdminFromSchool(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "admins",
			subjectId: identityId,
		});
	}
}
