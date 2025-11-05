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

import { CreateFloorDto } from "./dto/create-floor.dto";
import { UpdateFloorDto } from "./dto/update-floor.dto";

import { FloorEntity } from "./entities/floor.entity";

import { FloorsService } from "./floors.service";

@Controller("floors")
export class FloorsController {
	constructor(private readonly floorsService: FloorsService) {}

	/**
	 * Create a new floor
	 */
	@Post()
	@ApiPost({ type: FloorEntity })
	@Auth("Access token", {
		OR: ["floor:create", "floor:*"],
	})
	async create(@Body() createFloorDto: CreateFloorDto) {
		return FloorEntity.fromPlain(
			await this.floorsService.create(createFloorDto)
		);
	}

	/**
	 * Get all floors for a building
	 */
	@Get("building/:buildingId")
	@ApiGet({ type: [FloorEntity] })
	@Auth("Access token", {
		OR: ["floor:read", "floor:*"],
	})
	async findAllByBuilding(
		@Param("buildingId", ParseUUIDPipe) buildingId: string
	) {
		const floors = await this.floorsService.findAllByBuilding(buildingId);

		return floors.map(floorEntity => FloorEntity.fromPlain(floorEntity));
	}

	/**
	 * Get a floor by ID
	 */
	@Get(":id")
	@ApiGet({ type: FloorEntity })
	@Auth("Access token", {
		OR: ["floor:read", "floor:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return FloorEntity.fromPlain(await this.floorsService.findOne(id));
	}

	/**
	 * Update a floor by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: FloorEntity })
	@Auth("Access token", {
		OR: ["floor:update", "floor:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateFloorDto: UpdateFloorDto
	) {
		return FloorEntity.fromPlain(
			await this.floorsService.update(id, updateFloorDto)
		);
	}

	/**
	 * Delete a floor by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: FloorEntity })
	@Auth("Access token", {
		OR: ["floor:delete", "floor:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return FloorEntity.fromPlain(await this.floorsService.remove(id));
	}
}
