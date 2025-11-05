import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { SchoolsService } from "@resources/schools/schools.service";
import { UsersService } from "@resources/users/users.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService
	) {}

	async create(createRoleDto: CreateRoleDto) {
		await this.schoolsService.ensureExists(createRoleDto.schoolId);

		if (createRoleDto.userIds) {
			await this.usersService.ensureExistsMany(createRoleDto.userIds);
		}

		const role = await this.prisma.client.role.create({
			data: {
				// remove userIds from the dto to avoid unknown field error
				...{ ...createRoleDto, userIds: undefined },
				users: {
					connect: createRoleDto.userIds?.map(id => ({ id })) ?? [],
				},
			},
			include: {
				users: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...role,
			users: undefined,
			userIds: role.users.map(user => user.id),
		};
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		const roles = await this.prisma.client.role.findMany({
			where: { schoolId },
			include: {
				users: { select: { id: true }, where: { deleted: false } },
			},
		});

		return roles.map(role => ({
			...role,
			users: undefined,
			userIds: role.users.map(user => user.id),
		}));
	}

	async findOne(id: string) {
		const role = await this.prisma.client.role.findUniqueOrThrow({
			where: { id },
			include: {
				users: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...role,
			users: undefined,
			userIds: role.users.map(user => user.id),
		};
	}

	async update(id: string, updateRoleDto: UpdateRoleDto) {
		if (updateRoleDto.schoolId) {
			await this.schoolsService.ensureExists(updateRoleDto.schoolId);
		}

		if (updateRoleDto.userIds) {
			await this.usersService.ensureExistsMany(updateRoleDto.userIds);
		}

		const role = await this.prisma.client.role.update({
			where: { id },
			data: {
				// remove userIds from the dto to avoid unknown field error
				...{ ...updateRoleDto, userIds: undefined },
				users: updateRoleDto.userIds
					? { set: updateRoleDto.userIds.map(id => ({ id })) }
					: undefined,
			},
			include: {
				users: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...role,
			users: undefined,
			userIds: role.users.map(user => user.id),
		};
	}

	remove(id: string) {
		return this.prisma.client.role.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.role.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.role.ensureExistsMany(ids);
	}
}
