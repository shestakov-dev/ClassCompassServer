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

import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

import { StudentEntity } from "./entities/student.entity";

import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
	constructor(private readonly studentsService: StudentsService) {}

	/**
	 * Create a new student
	 */
	@Post()
	@ApiPost({ type: StudentEntity })
	@Auth("Access token", {
		OR: ["student:create", "student:*"],
	})
	async create(@Body() createStudentDto: CreateStudentDto) {
		return StudentEntity.fromPlain(
			await this.studentsService.create(createStudentDto)
		);
	}

	/**
	 * Get all students for a class
	 */
	@Get("class/:classId")
	@ApiGet({ type: [StudentEntity] })
	@Auth("Access token", {
		OR: ["student:read", "student:*"],
	})
	async findAll(@Param("classId", ParseUUIDPipe) classId: string) {
		const students = await this.studentsService.findAllByClass(classId);

		return students.map(student => StudentEntity.fromPlain(student));
	}

	/**
	 * Get a student by ID
	 */
	@Get(":id")
	@ApiGet({ type: StudentEntity })
	@Auth("Access token", {
		OR: ["student:read", "student:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return StudentEntity.fromPlain(await this.studentsService.findOne(id));
	}

	/**
	 * Update a student by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: StudentEntity })
	@Auth("Access token", {
		OR: ["student:update", "student:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateStudentDto: UpdateStudentDto
	) {
		return StudentEntity.fromPlain(
			await this.studentsService.update(id, updateStudentDto)
		);
	}

	/**
	 * Delete a student by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: StudentEntity })
	@Auth("Access token", {
		OR: ["student:delete", "student:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return StudentEntity.fromPlain(await this.studentsService.remove(id));
	}
}
