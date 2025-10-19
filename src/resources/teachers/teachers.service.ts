import { Injectable } from "@nestjs/common";

import { UsersService } from "@resources/users/users.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

@Injectable()
export class TeachersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService
	) {}

	async create(createTeacherDto: CreateTeacherDto) {
		await this.usersService.ensureExists(createTeacherDto.userId);

		return this.prisma.client.teacher.create({
			data: createTeacherDto,
		});
	}

	findOne(id: string) {
		return this.prisma.client.teacher.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateTeacherDto: UpdateTeacherDto) {
		if (updateTeacherDto.userId) {
			await this.usersService.ensureExists(updateTeacherDto.userId);
		}

		return this.prisma.client.teacher.update({
			where: { id },
			data: updateTeacherDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.teacher.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.teacher.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.teacher.ensureExistsMany(ids);
	}
}
