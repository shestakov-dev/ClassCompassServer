import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	Logger,
} from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { KratosService } from "@resources/ory/kratos/kratos.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

type UserCreateRollbackState = {
	userId: string;
	schoolId: string;
	identityId: string;
	parentSchoolLinked: boolean;
	schoolMemberLinked: boolean;
};

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

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

		const rollbackState: UserCreateRollbackState = {
			userId: newUser.id,
			schoolId: createUserDto.schoolId,
			identityId: kratosIdentity.id,
			parentSchoolLinked: false,
			schoolMemberLinked: false,
		};

		// Add parent school relationship
		try {
			await this.addParentSchool(newUser.id, createUserDto.schoolId);

			rollbackState.parentSchoolLinked = true;

			// Add the user as a member of the school
			await this.addMemberToSchool(
				createUserDto.schoolId,
				kratosIdentity.id
			);

			rollbackState.schoolMemberLinked = true;
		} catch (error) {
			await this.rollbackFailedCreate(rollbackState);

			throw error;
		}

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
		const existingUser = await this.prisma.client.user.findUniqueOrThrow({
			where: { id },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		if (updateUserDto.schoolId) {
			await this.schoolsService.ensureExists(updateUserDto.schoolId);
		}

		await this.kratosService.updateIdentity(existingUser.identityId, {
			email: updateUserDto.email ?? existingUser.email,
			firstName: updateUserDto.firstName ?? existingUser.firstName,
			lastName: updateUserDto.lastName ?? existingUser.lastName,
		});

		try {
			const updatedUser = await this.prisma.client.user.update({
				where: { id },
				data: updateUserDto,
				include: {
					student: true,
					teacher: { include: { subjects: true } },
				},
			});

			return updatedUser;
		} catch (error) {
			await this.kratosService.updateIdentity(existingUser.identityId, {
				email: existingUser.email,
				firstName: existingUser.firstName,
				lastName: existingUser.lastName,
			});

			throw error;
		}
	}

	async remove(id: string) {
		const removedUser = await this.prisma.client.user.findUniqueOrThrow({
			where: { id },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		const hadMemberAccess = await this.ketoService.checkPermission({
			namespace: KetoNamespace.School,
			object: removedUser.schoolId,
			relation: "members",
			subjectId: removedUser.identityId,
		});

		const hadAdminAccess = await this.ketoService.checkPermission({
			namespace: KetoNamespace.School,
			object: removedUser.schoolId,
			relation: "admins",
			subjectId: removedUser.identityId,
		});

		const deletedUser = await this.prisma.client.user.delete({
			where: { id },
			include: {
				student: true,
				teacher: { include: { subjects: true } },
			},
		});

		await this.kratosService.deleteIdentity(removedUser.identityId);

		await this.removeParentSchool(removedUser.id, removedUser.schoolId);

		if (hadMemberAccess) {
			await this.removeMemberFromSchool(
				removedUser.schoolId,
				removedUser.identityId
			);
		}

		if (hadAdminAccess) {
			await this.removeAdminFromSchool(
				removedUser.schoolId,
				removedUser.identityId
			);
		}

		return deletedUser;
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

	private async rollbackFailedCreate(state: UserCreateRollbackState) {
		if (state.schoolMemberLinked) {
			try {
				await this.removeMemberFromSchool(
					state.schoolId,
					state.identityId
				);
			} catch (cleanupError) {
				this.logger.error(
					"Failed to remove user member relationship:",
					cleanupError
				);
			}
		}

		if (state.parentSchoolLinked) {
			try {
				await this.removeParentSchool(state.userId, state.schoolId);
			} catch (cleanupError) {
				this.logger.error(
					"Failed to remove user parent school relationship:",
					cleanupError
				);
			}
		}

		try {
			await this.prisma.client.user.delete({
				where: { id: state.userId },
			});
		} catch (cleanupError) {
			this.logger.error(
				"Failed to remove user from Prisma:",
				cleanupError
			);
		}

		try {
			await this.kratosService.deleteIdentity(state.identityId);
		} catch (cleanupError) {
			this.logger.error(
				"Failed to remove Kratos identity after user rollback:",
				cleanupError
			);
		}
	}
}
