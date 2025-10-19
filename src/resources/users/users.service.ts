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

		// hash the user's password with 12 rounds of salt
		createUserDto.password = await hash(createUserDto.password, 12);

		const user = await this.prisma.client.user.create({
			data: {
				// remove roleIds from the dto to avoid unknown field error
				...{ ...createUserDto, roleIds: undefined },
				roles: {
					connect: createUserDto.roleIds?.map(id => ({ id })) ?? [],
				},
			},
			include: {
				roles: {
					select: { id: true },
				},
			},
		});

		return {
			...user,
			roles: undefined,
			roleIds: user.roles.map(role => role.id),
		};
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		const users = await this.prisma.client.user.findMany({
			where: { schoolId },
			include: { roles: { select: { id: true } } },
		});

		return users.map(user => ({
			...user,
			roles: undefined,
			roleIds: user.roles.map(role => role.id),
		}));
	}

	async findOne(id: string) {
		const user = await this.prisma.client.user.findUniqueOrThrow({
			where: { id },
			include: { roles: { select: { id: true } } },
		});

		return {
			...user,
			roles: undefined,
			roleIds: user.roles.map(role => role.id),
		};
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		if (updateUserDto.schoolId) {
			await this.schoolsService.ensureExists(updateUserDto.schoolId);
		}

		if (updateUserDto.roleIds) {
			await this.rolesService.ensureExistsMany(updateUserDto.roleIds);
		}

		const user = await this.prisma.client.user.update({
			where: { id },
			data: {
				// remove roleIds from the dto to avoid unknown field error
				...{ ...updateUserDto, roleIds: undefined },
				roles: updateUserDto.roleIds
					? {
							set: updateUserDto.roleIds.map(roleId => ({
								id: roleId,
							})),
						}
					: undefined,
			},
			include: { roles: { select: { id: true } } },
		});

		return {
			...user,
			roles: undefined,
			roleIds: user.roles.map(role => role.id),
		};
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

	async getAttributes(id: string) {
		const user = await this.prisma.client.user.findUniqueOrThrow({
			where: { id },
			select: {
				roles: {
					select: {
						attributes: true,
					},
				},
			},
		});

		return user.roles.reduce((attributes: Attribute[], role) => {
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
