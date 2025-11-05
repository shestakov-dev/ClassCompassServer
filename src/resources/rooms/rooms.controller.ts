import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from "@nestjs/common";

import { ApiDelete, ApiGet, ApiPatch, ApiPost, Auth } from "@decorators";

import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

import { RoomEntity } from "./entities/room.entity";

import { RoomsService } from "./rooms.service";

@Controller("rooms")
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	/**
	 * Create a new room
	 */
	@Post()
	@ApiPost({ type: RoomEntity })
	@Auth("Access token", {
		OR: ["room:create", "room:*"],
	})
	async create(@Body() createRoomDto: CreateRoomDto) {
		return RoomEntity.fromPlain(
			await this.roomsService.create(createRoomDto)
		);
	}

	/**
	 * Get all rooms for a floor
	 */
	@Get("floor/:floorId")
	@ApiGet({ type: [RoomEntity] })
	@Auth("Access token", {
		OR: ["room:read", "room:*"],
	})
	async findAllByFloor(@Param("floorId", ParseUUIDPipe) floorId: string) {
		const rooms = await this.roomsService.findAllByFloor(floorId);

		return rooms.map(room => RoomEntity.fromPlain(room));
	}

	/**
	 * Get a room by ID
	 */
	@Get(":id")
	@ApiGet({ type: RoomEntity })
	@Auth("Access token", {
		OR: ["room:read", "room:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return RoomEntity.fromPlain(await this.roomsService.findOne(id));
	}

	/**
	 * Update a room by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: RoomEntity })
	@Auth("Access token", {
		OR: ["room:update", "room:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateRoomDto: UpdateRoomDto
	) {
		return RoomEntity.fromPlain(
			await this.roomsService.update(id, updateRoomDto)
		);
	}

	/**
	 * Delete a room by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: RoomEntity })
	@Auth("Access token", {
		OR: ["room:delete", "room:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return RoomEntity.fromPlain(await this.roomsService.remove(id));
	}
}
