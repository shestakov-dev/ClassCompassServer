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
	@KetoPermission<CreateStudentDto>({
		namespace: KetoNamespace.User,
		relation: "manage",
		source: "body",
		key: "userId",
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
	async findAllByClass(@Param("classId", ParseUUIDPipe) classId: string) {
		const students = await this.studentsService.findAllByClass(classId);

		return students.map(student => StudentEntity.fromPlain(student));
	}

	/**
	 * Get a student by ID
	 */
	@Get(":id")
	@ApiGet({ type: StudentEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return StudentEntity.fromPlain(await this.studentsService.findOne(id));
	}

	/**
	 * Update a student by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: StudentEntity })
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return StudentEntity.fromPlain(await this.studentsService.remove(id));
	}
}
