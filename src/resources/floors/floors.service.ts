import { Injectable, NotFoundException } from "@nestjs/common";

import { BuildingsService } from "@resources/buildings/buildings.service";
import { MinioService } from "@resources/minio/minio.service";
import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateFloorDto } from "./dto/create-floor.dto";
import { UpdateFloorDto } from "./dto/update-floor.dto";

@Injectable()
export class FloorsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly buildingsService: BuildingsService,
		private readonly ketoService: KetoService,
		private readonly minioService: MinioService
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

	async remove(id: string) {
		const removedFloor = await this.prisma.client.floor.delete({
			where: { id },
		});

		// Remove parent building relationship
		await this.removeParentBuilding(
			removedFloor.id,
			removedFloor.buildingId
		);

		return removedFloor;
	}

	async uploadFloorPlan(
		id: string,
		file: Express.Multer.File
	): Promise<void> {
		await this.ensureExists(id);

		const etag = await this.minioService.putObject(
			id,
			file.buffer,
			file.size,
			file.mimetype
		);

		await this.prisma.client.floor.update({
			where: { id },
			data: { floorPlanETag: etag },
		});
	}

	async getFloorPlanUrl(id: string): Promise<string> {
		const floor = await this.prisma.client.floor.findUnique({
			where: { id },
		});

		if (!floor) {
			throw new NotFoundException(`Floor with id "${id}" not found`);
		}

		if (!floor.floorPlanETag) {
			throw new NotFoundException(
				`Floor with id "${id}" has no floor plan`
			);
		}

		return this.minioService.getPresignedUrl(id);
	}

	async deleteFloorPlan(id: string): Promise<void> {
		const floor = await this.prisma.client.floor.findUnique({
			where: { id },
		});

		if (!floor) {
			throw new NotFoundException(`Floor with id "${id}" not found`);
		}

		if (!floor.floorPlanETag) {
			throw new NotFoundException(
				`Floor with id "${id}" has no floor plan`
			);
		}

		await this.minioService.removeObject(id);

		await this.prisma.client.floor.update({
			where: { id },
			data: { floorPlanETag: null },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.floor.ensureExists(id);
	}

	private async addParentBuilding(floorId: string, buildingId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Floor,
			floorId,
			buildingId
		);
	}

	private async removeParentBuilding(floorId: string, buildingId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Floor,
			floorId,
			buildingId
		);
	}
}
