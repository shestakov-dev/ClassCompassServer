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
	@Auth("Access token", {
		OR: ["teacher:create", "teacher:*"],
	})
	async create(@Body() createTeacherDto: CreateTeacherDto) {
		return TeacherEntity.fromPlain(
			await this.teachersService.create(createTeacherDto)
		);
	}

	/**
	 * Get a teacher by ID
	 */
	@Get(":id")
	@ApiGet({ type: TeacherEntity })
	@Auth("Access token", {
		OR: ["teacher:read", "teacher:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return TeacherEntity.fromPlain(await this.teachersService.findOne(id));
	}

	/**
	 * Update a teacher by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: TeacherEntity })
	@Auth("Access token", {
		OR: ["teacher:update", "teacher:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateTeacherDto: UpdateTeacherDto
	) {
		return TeacherEntity.fromPlain(
			await this.teachersService.update(id, updateTeacherDto)
		);
	}

	/**
	 * Delete a teacher by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: TeacherEntity })
	@Auth("Access token", {
		OR: ["teacher:delete", "teacher:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return TeacherEntity.fromPlain(await this.teachersService.remove(id));
	}
}
