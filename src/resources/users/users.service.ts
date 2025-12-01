import { Injectable } from "@nestjs/common";

import { KratosService } from "@resources/ory/kratos/kratos.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		private readonly kratosService: KratosService
	) {}

	async create(createUserDto: CreateUserDto) {
		await this.schoolsService.ensureExists(createUserDto.schoolId);

		// Create an identity for the user in Ory Kratos
		const kratosIdentity = await this.kratosService.createIdentity({
			email: createUserDto.email,
			firstName: createUserDto.firstName,
			lastName: createUserDto.lastName,
		});

		return this.prisma.client.user.create({
			data: {
				...createUserDto,
				identityId: kratosIdentity.id,
			},
		});
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.user.findMany({
			where: { schoolId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { id },
		});
	}

	findOneByIdentityId(identityId: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { identityId },
		});
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		if (updateUserDto.schoolId) {
			await this.schoolsService.ensureExists(updateUserDto.schoolId);
		}

		const updatedUser = await this.prisma.client.user.update({
			where: { id },
			data: updateUserDto,
		});

		await this.kratosService.updateIdentity(updatedUser.identityId, {
			email: updatedUser.email,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
		});

		return updatedUser;
	}

	remove(id: string) {
		return this.prisma.client.user.softDelete({
			where: { id },
		});
	}

	findOneByEmail(email: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { email },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.user.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.user.ensureExistsMany(ids);
	}
}
