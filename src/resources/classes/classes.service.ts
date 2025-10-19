import { Injectable } from "@nestjs/common";

import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

@Injectable()
export class ClassesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService
	) {}

	async create(createClassDto: CreateClassDto) {
		await this.schoolsService.ensureExists(createClassDto.schoolId);

		return this.prisma.client.class.create({
			data: createClassDto,
		});
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.class.findMany({
			where: { schoolId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.class.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateClassDto: UpdateClassDto) {
		if (updateClassDto.schoolId) {
			await this.schoolsService.ensureExists(updateClassDto.schoolId);
		}

		return this.prisma.client.class.update({
			where: { id },
			data: updateClassDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.class.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.class.ensureExists(id);
	}
}
