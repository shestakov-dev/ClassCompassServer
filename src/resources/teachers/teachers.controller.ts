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
	@KetoPermission<CreateTeacherDto>({
		namespace: KetoNamespace.User,
		relation: "manage",
		source: "body",
		key: "userId",
	})
	async create(@Body() createTeacherDto: CreateTeacherDto) {
		return TeacherEntity.fromPlain(
			await this.teachersService.create(createTeacherDto)
		);
	}

	/**
	 * Get all teachers for a school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [TeacherEntity] })
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const teachers = await this.teachersService.findAllBySchool(schoolId);

		return teachers.map(teacher => TeacherEntity.fromPlain(teacher));
	}

	/**
	 * Get a teacher by ID
	 */
	@Get(":id")
	@ApiGet({ type: TeacherEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return TeacherEntity.fromPlain(await this.teachersService.findOne(id));
	}

	/**
	 * Update a teacher by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: TeacherEntity })
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return TeacherEntity.fromPlain(await this.teachersService.remove(id));
	}
}
