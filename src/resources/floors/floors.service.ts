import { Injectable } from "@nestjs/common";

import { BuildingsService } from "@resources/buildings/buildings.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateFloorDto } from "./dto/create-floor.dto";
import { UpdateFloorDto } from "./dto/update-floor.dto";

@Injectable()
export class FloorsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly buildingsService: BuildingsService
	) {}

	async create(createFloorDto: CreateFloorDto) {
		await this.buildingsService.ensureExists(createFloorDto.buildingId);

		return this.prisma.client.floor.create({
			data: createFloorDto,
		});
	}

	async findAllByBuilding(buildingId: string) {
		await this.buildingsService.ensureExists(buildingId);

		return this.prisma.client.floor.findMany({
			where: { buildingId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.floor.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateFloorDto: UpdateFloorDto) {
		if (updateFloorDto.buildingId) {
			await this.buildingsService.ensureExists(updateFloorDto.buildingId);
		}

		return this.prisma.client.floor.update({
			where: { id },
			data: updateFloorDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.floor.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.floor.ensureExists(id);
	}
}
