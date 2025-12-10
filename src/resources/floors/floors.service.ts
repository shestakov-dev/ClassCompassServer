import { Injectable } from "@nestjs/common";

import { BuildingsService } from "@resources/buildings/buildings.service";
import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateFloorDto } from "./dto/create-floor.dto";
import { UpdateFloorDto } from "./dto/update-floor.dto";

@Injectable()
export class FloorsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly buildingsService: BuildingsService,
		private readonly ketoService: KetoService
	) {}

	async create(createFloorDto: CreateFloorDto) {
		await this.buildingsService.ensureExists(createFloorDto.buildingId);

		const newFloor = await this.prisma.client.floor.create({
			data: createFloorDto,
		});

		// Add parent building relationship
		await this.addParentBuilding(newFloor.id, newFloor.buildingId);

		return newFloor;
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

	private async addParentBuilding(floorId: string, buildingId: string) {
		await this.ketoService.createRelationship({
			namespace: "Floor",
			object: floorId,
			relation: "parentBuilding",
			subjectSet: {
				namespace: "Building",
				object: buildingId,
			},
		});
	}

	private async removeParentBuilding(floorId: string, buildingId: string) {
		await this.ketoService.deleteRelationship({
			namespace: "Floor",
			object: floorId,
			relation: "parentBuilding",
			subjectSet: {
				namespace: "Building",
				object: buildingId,
			},
		});
	}
}
