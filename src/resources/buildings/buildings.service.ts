import { Injectable } from "@nestjs/common";

import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateBuildingDto } from "./dto/create-building.dto";
import { UpdateBuildingDto } from "./dto/update-building.dto";

@Injectable()
export class BuildingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService
	) {}

	async create(createBuildingDto: CreateBuildingDto) {
		await this.schoolsService.ensureExists(createBuildingDto.schoolId);

		return this.prisma.client.building.create({
			data: createBuildingDto,
		});
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.building.findMany({
			where: { schoolId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.building.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateBuildingDto: UpdateBuildingDto) {
		if (updateBuildingDto.schoolId) {
			await this.schoolsService.ensureExists(updateBuildingDto.schoolId);
		}

		return this.prisma.client.building.update({
			where: { id },
			data: updateBuildingDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.building.delete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.building.ensureExists(id);
	}
}
