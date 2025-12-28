import { Injectable } from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateBuildingDto } from "./dto/create-building.dto";
import { UpdateBuildingDto } from "./dto/update-building.dto";

@Injectable()
export class BuildingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		private readonly ketoService: KetoService
	) {}

	async create(createBuildingDto: CreateBuildingDto) {
		await this.schoolsService.ensureExists(createBuildingDto.schoolId);

		const newBuilding = await this.prisma.client.building.create({
			data: createBuildingDto,
			include: {
				floors: {
					where: { deleted: false },
					include: {
						rooms: { where: { deleted: false } },
					},
				},
			},
		});

		// Add parent school relationship
		await this.addParentSchool(newBuilding.id, createBuildingDto.schoolId);

		return newBuilding;
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.building.findMany({
			where: { schoolId },
			include: {
				floors: {
					where: { deleted: false },
					include: {
						rooms: { where: { deleted: false } },
					},
				},
			},
		});
	}

	findOne(id: string) {
		return this.prisma.client.building.findUniqueOrThrow({
			where: { id },
			include: {
				floors: {
					where: { deleted: false },
					include: {
						rooms: { where: { deleted: false } },
					},
				},
			},
		});
	}

	async update(id: string, updateBuildingDto: UpdateBuildingDto) {
		if (updateBuildingDto.schoolId) {
			await this.schoolsService.ensureExists(updateBuildingDto.schoolId);
		}

		return this.prisma.client.building.update({
			where: { id },
			data: updateBuildingDto,
			include: {
				floors: {
					where: { deleted: false },
					include: {
						rooms: { where: { deleted: false } },
					},
				},
			},
		});
	}

	async remove(id: string) {
		const removedBuilding = await this.prisma.client.building.softDelete({
			where: { id },
			include: {
				floors: {
					where: { deleted: false },
					include: {
						rooms: { where: { deleted: false } },
					},
				},
			},
		});

		// Remove parent school relationship
		await this.removeParentSchool(
			removedBuilding.id,
			removedBuilding.schoolId
		);

		return removedBuilding;
	}

	async ensureExists(id: string) {
		await this.prisma.client.building.ensureExists(id);
	}

	private async addParentSchool(buildingId: string, schoolId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Building,
			buildingId,
			schoolId
		);
	}

	private async removeParentSchool(buildingId: string, schoolId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Building,
			buildingId,
			schoolId
		);
	}
}
