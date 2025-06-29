import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { ObjectIdValidationPipe } from "@shared/pipes/object-id-validation/object-id-validation.pipe";

import { ApiDelete, ApiGet, ApiPatch, ApiPost, Attributes } from "@decorators";

import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

import { ClassEntity } from "./entities/class.entity";

import { ClassesService } from "./classes.service";

@Controller("classes")
export class ClassesController {
	constructor(private readonly classesService: ClassesService) {}

	/**
	 * Create a new class
	 * Required attributes: "class:create" or "class:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Post()
	@ApiPost({ type: ClassEntity })
	@Attributes({
		OR: ["class:create", "class:*"],
	})
	@ApiBearerAuth("Access Token")
	async create(@Body() createClassDto: CreateClassDto) {
		return new ClassEntity(
			await this.classesService.create(createClassDto)
		);
	}

	/**
	 * Get all classes for a school
	 * Required attributes: "class:read" or "class:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [ClassEntity] })
	@Attributes({
		OR: ["class:read", "class:*"],
	})
	@ApiBearerAuth("Access Token")
	async findAllBySchool(
		@Param("schoolId", ObjectIdValidationPipe) schoolId: string
	) {
		const classes = await this.classesService.findAllBySchool(schoolId);

		return classes.map(classEntity => new ClassEntity(classEntity));
	}

	/**
	 * Get a class by ID
	 * Required attributes: "class:read" or "class:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Get(":id")
	@ApiGet({ type: ClassEntity })
	@Attributes({
		OR: ["class:read", "class:*"],
	})
	@ApiBearerAuth("Access Token")
	async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
		return new ClassEntity(await this.classesService.findOne(id));
	}

	/**
	 * Update a class by ID
	 * Required attributes: "class:update" or "class:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Patch(":id")
	@ApiPatch({ type: ClassEntity })
	@Attributes({
		OR: ["class:update", "class:*"],
	})
	@ApiBearerAuth("Access Token")
	async update(
		@Param("id", ObjectIdValidationPipe) id: string,
		@Body() updateClassDto: UpdateClassDto
	) {
		return new ClassEntity(
			await this.classesService.update(id, updateClassDto)
		);
	}

	/**
	 * Delete a class by ID
	 * Required attributes: "class:delete" or "class:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Delete(":id")
	@ApiDelete({ type: ClassEntity })
	@Attributes({
		OR: ["class:delete", "class:*"],
	})
	@ApiBearerAuth("Access Token")
	async remove(@Param("id", ObjectIdValidationPipe) id: string) {
		return new ClassEntity(await this.classesService.remove(id));
	}
}
