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

import { KetoNamespace } from "@resources/ory/keto/definitions";

import { KetoPermission } from "@shared/decorators/keto-permission.decorator";

import { ApiDelete, ApiGet, ApiPatch, ApiPost } from "@decorators";

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
	@KetoPermission<CreateBuildingDto>({
		namespace: KetoNamespace.School,
		relation: "manage",
		source: "body",
		key: "schoolId",
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
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const buildings = await this.buildingsService.findAllBySchool(schoolId);

		return buildings.map(building => BuildingEntity.fromPlain(building));
	}

	/**
	 * Get a building by ID
	 */
	@Get(":id")
	@ApiGet({ type: BuildingEntity })
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return BuildingEntity.fromPlain(await this.buildingsService.remove(id));
	}
}
