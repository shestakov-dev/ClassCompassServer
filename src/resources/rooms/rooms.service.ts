import { Injectable } from "@nestjs/common";

import { FloorsService } from "@resources/floors/floors.service";
import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly floorsService: FloorsService,
		private readonly ketoService: KetoService
	) {}

	async create(createRoomDto: CreateRoomDto) {
		await this.floorsService.ensureExists(createRoomDto.floorId);

		const newRoom = await this.prisma.client.room.create({
			data: createRoomDto,
		});

		// Add parent floor relationship
		await this.addParentFloor(newRoom.id, newRoom.floorId);

		return newRoom;
	}

	async findAllByFloor(floorId: string) {
		await this.floorsService.ensureExists(floorId);

		return this.prisma.client.room.findMany({
			where: { floorId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.room.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateRoomDto: UpdateRoomDto) {
		if (updateRoomDto.floorId) {
			await this.floorsService.ensureExists(updateRoomDto.floorId);
		}

		return this.prisma.client.room.update({
			where: { id },
			data: updateRoomDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.room.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.room.ensureExists(id);
	}

	private async addParentFloor(roomId: string, floorId: string) {
		await this.ketoService.createRelationship({
			namespace: "Room",
			object: roomId,
			relation: "parentFloor",
			subjectSet: {
				namespace: "Floor",
				object: floorId,
			},
		});
	}

	private async removeParentFloor(roomId: string, floorId: string) {
		await this.ketoService.deleteRelationship({
			namespace: "Room",
			object: roomId,
			relation: "parentFloor",
			subjectSet: {
				namespace: "Floor",
				object: floorId,
			},
		});
	}
}
