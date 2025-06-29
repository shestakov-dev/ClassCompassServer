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

import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

import { TeacherEntity } from "./entities/teacher.entity";

import { TeachersService } from "./teachers.service";

@Controller("teachers")
export class TeachersController {
	constructor(private readonly teachersService: TeachersService) {}

	/**
	 * Create a new teacher
	 */
	@Post()
	@ApiPost({ type: TeacherEntity })
	@Attributes({
		OR: ["teacher:create", "teacher:*"],
	})
	@ApiBearerAuth("Access Token")
	async create(@Body() createTeacherDto: CreateTeacherDto) {
		return new TeacherEntity(
			await this.teachersService.create(createTeacherDto)
		);
	}

	/**
	 * Get a teacher by ID
	 */
	@Get(":id")
	@ApiGet({ type: TeacherEntity })
	@Attributes({
		OR: ["teacher:read", "teacher:*"],
	})
	@ApiBearerAuth("Access Token")
	async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
		return new TeacherEntity(await this.teachersService.findOne(id));
	}

	/**
	 * Update a teacher by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: TeacherEntity })
	@Attributes({
		OR: ["teacher:update", "teacher:*"],
	})
	@ApiBearerAuth("Access Token")
	async update(
		@Param("id", ObjectIdValidationPipe) id: string,
		@Body() updateTeacherDto: UpdateTeacherDto
	) {
		return new TeacherEntity(
			await this.teachersService.update(id, updateTeacherDto)
		);
	}

	/**
	 * Delete a teacher by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: TeacherEntity })
	@Attributes({
		OR: ["teacher:delete", "teacher:*"],
	})
	@ApiBearerAuth("Access Token")
	async remove(@Param("id", ObjectIdValidationPipe) id: string) {
		return new TeacherEntity(await this.teachersService.remove(id));
	}
}
