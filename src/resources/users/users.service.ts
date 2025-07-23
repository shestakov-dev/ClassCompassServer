import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";

import { RolesService } from "@resources/roles/roles.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { Attribute, isAttribute } from "@shared/types/attributes";

import { PrismaService } from "@prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		@Inject(forwardRef(() => RolesService))
		private readonly rolesService: RolesService
	) {}

	async create(createUserDto: CreateUserDto) {
		await this.schoolsService.ensureExists(createUserDto.schoolId);

		if (createUserDto.roleIds) {
			await this.rolesService.ensureExistsMany(createUserDto.roleIds);
		}

		// hash the user's password with 11 rounds of salt
		createUserDto.password = await hash(createUserDto.password, 11);

		return this.prisma.client.user.create({
			data: createUserDto,
		});
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.user.findMany({
			where: { schoolId },
		});
	}

	async findOne(id: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		if (updateUserDto.schoolId) {
			await this.schoolsService.ensureExists(updateUserDto.schoolId);
		}

		if (updateUserDto.roleIds) {
			await this.rolesService.ensureExistsMany(updateUserDto.roleIds);
		}

		return this.prisma.client.user.update({
			where: { id },
			data: updateUserDto,
		});
	}

	async remove(id: string) {
		return this.prisma.client.user.softDelete({
			where: { id },
		});
	}

	async findOneByEmail(email: string) {
		return this.prisma.client.user.findUniqueOrThrow({
			where: { email },
		});
	}

	async getAttributes(id: string) {
		const user = await this.findOne(id);

		const roles = await Promise.all(
			user.roleIds.map(roleId => this.rolesService.findOne(roleId))
		);

		return roles.reduce((attributes: Attribute[], role) => {
			return [...attributes, ...role.attributes.filter(isAttribute)];
		}, []);
	}

	async ensureExists(id: string) {
		await this.prisma.client.user.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.user.ensureExistsMany(ids);
	}
}
