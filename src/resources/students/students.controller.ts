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
	@Attributes({
		OR: ["student:create", "student:*"],
	})
	@ApiBearerAuth("Access Token")
	async create(@Body() createStudentDto: CreateStudentDto) {
		return new StudentEntity(
			await this.studentsService.create(createStudentDto)
		);
	}

	/**
	 * Get all students for a class
	 */
	@Get("class/:classId")
	@ApiGet({ type: [StudentEntity] })
	@Attributes({
		OR: ["student:read", "student:*"],
	})
	@ApiBearerAuth("Access Token")
	async findAll(@Param("classId", ObjectIdValidationPipe) classId: string) {
		const students = await this.studentsService.findAllByClass(classId);

		return students.map(student => new StudentEntity(student));
	}

	/**
	 * Get a student by ID
	 */
	@Get(":id")
	@ApiGet({ type: StudentEntity })
	@Attributes({
		OR: ["student:read", "student:*"],
	})
	@ApiBearerAuth("Access Token")
	async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
		return new StudentEntity(await this.studentsService.findOne(id));
	}

	/**
	 * Update a student by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: StudentEntity })
	@Attributes({
		OR: ["student:update", "student:*"],
	})
	@ApiBearerAuth("Access Token")
	async update(
		@Param("id", ObjectIdValidationPipe) id: string,
		@Body() updateStudentDto: UpdateStudentDto
	) {
		return new StudentEntity(
			await this.studentsService.update(id, updateStudentDto)
		);
	}

	/**
	 * Delete a student by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: StudentEntity })
	@Attributes({
		OR: ["student:delete", "student:*"],
	})
	@ApiBearerAuth("Access Token")
	async remove(@Param("id", ObjectIdValidationPipe) id: string) {
		return new StudentEntity(await this.studentsService.remove(id));
	}
}
