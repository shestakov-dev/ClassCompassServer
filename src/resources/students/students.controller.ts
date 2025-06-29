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
	 * Required attributes: "student:create" or "student:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "student:read" or "student:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "student:read" or "student:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "student:update" or "student:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "student:delete" or "student:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
