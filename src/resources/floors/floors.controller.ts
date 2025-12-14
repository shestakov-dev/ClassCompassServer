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
	@KetoPermission<CreateFloorDto>({
		namespace: KetoNamespace.Building,
		relation: "manage",
		source: "body",
		key: "buildingId",
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
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return FloorEntity.fromPlain(await this.floorsService.findOne(id));
	}

	/**
	 * Update a floor by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: FloorEntity })
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return FloorEntity.fromPlain(await this.floorsService.remove(id));
	}
}
