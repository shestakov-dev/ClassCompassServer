import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseFilePipeBuilder,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

import { KetoNamespace } from "@resources/ory/keto/definitions";

import { ApiPut } from "@shared/decorators/api-put.decorator";
import { KetoPermission } from "@shared/decorators/keto-permission.decorator";

import { ApiDelete, ApiGet, ApiPatch, ApiPost } from "@decorators";

import { CreateFloorDto } from "./dto/create-floor.dto";
import { UpdateFloorDto } from "./dto/update-floor.dto";
import { UploadFloorPlanDto } from "./dto/upload-floor-plan.dto";

import { FloorPlanUrlEntity } from "./entities/floor-plan-url.entity";
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

	/**
	 * Upload or replace a floor plan SVG for a floor
	 */
	@Put(":id/plan")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiPut({
		type: undefined,
		successResponse: HttpStatus.NO_CONTENT,
		errorResponses: [
			HttpStatus.BAD_REQUEST,
			HttpStatus.NOT_FOUND,
			HttpStatus.UNPROCESSABLE_ENTITY,
		],
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		type: UploadFloorPlanDto,
		description: "The floor plan image file (SVG only)",
	})
	@UseInterceptors(FileInterceptor("file"))
	async uploadFloorPlan(
		@Param("id", ParseUUIDPipe) id: string,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: /image\/svg\+xml/,
					skipMagicNumbersValidation: true,
				})
				.addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 }) // 2 MB limit
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
					fileIsRequired: true,
				})
		)
		file: Express.Multer.File
	) {
		await this.floorsService.uploadFloorPlan(id, file);
	}

	/**
	 * Get a presigned URL to download the floor plan for a floor
	 */
	@Get(":id/plan")
	@ApiGet({
		type: FloorPlanUrlEntity,
	})
	async getFloorPlan(@Param("id", ParseUUIDPipe) id: string) {
		const url = await this.floorsService.getFloorPlanUrl(id);

		return FloorPlanUrlEntity.fromPlain({ url });
	}

	/**
	 * Delete the floor plan for a floor
	 */
	@Delete(":id/plan")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiDelete({
		type: undefined,
		successResponse: HttpStatus.NO_CONTENT,
	})
	async deleteFloorPlan(@Param("id", ParseUUIDPipe) id: string) {
		await this.floorsService.deleteFloorPlan(id);
	}
}
