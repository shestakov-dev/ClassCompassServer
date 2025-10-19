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

import { CreateBuildingDto } from "./dto/create-building.dto";
import { UpdateBuildingDto } from "./dto/update-building.dto";

import { BuildingEntity } from "./entities/building.entity";

import { BuildingsService } from "./buildings.service";

@Controller("buildings")
export class BuildingsController {
	constructor(private readonly buildingsService: BuildingsService) {}

	/**
	 * Create a new building
	 */
	@Post()
	@ApiPost({ type: BuildingEntity })
	@Auth("Access token", {
		OR: ["building:create", "building:*"],
	})
	async create(@Body() createBuildingDto: CreateBuildingDto) {
		return BuildingEntity.fromPlain(
			await this.buildingsService.create(createBuildingDto)
		);
	}

	/**
	 * Get all buildings for a specific school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [BuildingEntity] })
	@Auth("Access token", {
		OR: ["building:read", "building:*"],
	})
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const buildings = await this.buildingsService.findAllBySchool(schoolId);

		return buildings.map(building => BuildingEntity.fromPlain(building));
	}

	/**
	 * Get a building by ID
	 */
	@Get(":id")
	@ApiGet({ type: BuildingEntity })
	@Auth("Access token", {
		OR: ["building:read", "building:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return BuildingEntity.fromPlain(
			await this.buildingsService.findOne(id)
		);
	}

	/**
	 * Update a building by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: BuildingEntity })
	@Auth("Access token", {
		OR: ["building:update", "building:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateBuildingDto: UpdateBuildingDto
	) {
		return BuildingEntity.fromPlain(
			await this.buildingsService.update(id, updateBuildingDto)
		);
	}

	/**
	 * Delete a building by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: BuildingEntity })
	@Auth("Access token", {
		OR: ["building:delete", "building:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return BuildingEntity.fromPlain(await this.buildingsService.remove(id));
	}
}
