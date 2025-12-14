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

import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

import { SubjectEntity } from "./entities/subject.entity";

import { SubjectsService } from "./subjects.service";

@Controller("subjects")
export class SubjectsController {
	constructor(private readonly subjectsService: SubjectsService) {}

	/**
	 * Create a new subject
	 */
	@Post()
	@ApiPost({ type: SubjectEntity })
	@KetoPermission<CreateSubjectDto>({
		namespace: KetoNamespace.School,
		relation: "manage",
		source: "body",
		key: "schoolId",
	})
	async create(@Body() createSubjectDto: CreateSubjectDto) {
		return SubjectEntity.fromPlain(
			await this.subjectsService.create(createSubjectDto)
		);
	}

	/**
	 * Get all subjects for a school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [SubjectEntity] })
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const subjects = await this.subjectsService.findAllBySchool(schoolId);

		return subjects.map(subject => SubjectEntity.fromPlain(subject));
	}

	/**
	 * Get a subject by ID
	 */
	@Get(":id")
	@ApiGet({ type: SubjectEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return SubjectEntity.fromPlain(await this.subjectsService.findOne(id));
	}

	/**
	 * Update a subject by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: SubjectEntity })
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateSubjectDto: UpdateSubjectDto
	) {
		return SubjectEntity.fromPlain(
			await this.subjectsService.update(id, updateSubjectDto)
		);
	}

	/**
	 * Delete a subject by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: SubjectEntity })
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return SubjectEntity.fromPlain(await this.subjectsService.remove(id));
	}
}
