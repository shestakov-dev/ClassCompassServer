import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from "@nestjs/common";

import { ApiDelete, ApiGet, ApiPatch, ApiPost } from "@decorators";

import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

import { SchoolEntity } from "./entities/school.entity";

import { SchoolsService } from "./schools.service";

@Controller("schools")
export class SchoolsController {
	constructor(private readonly schoolsService: SchoolsService) {}

	/**
	 * Create a new school
	 */
	@Post()
	@ApiPost({
		type: SchoolEntity,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
	})
	async create(@Body() createSchoolDto: CreateSchoolDto) {
		return SchoolEntity.fromPlain(
			await this.schoolsService.create(createSchoolDto)
		);
	}

	/**
	 * Get all schools
	 */
	@Get()
	@ApiGet({
		type: [SchoolEntity],
		errorResponses: [],
	})
	async findAll() {
		const schools = await this.schoolsService.findAll();

		return Promise.all(
			schools.map(school => SchoolEntity.fromPlain(school))
		);
	}

	/**
	 * Get a school by ID
	 */
	@Get(":id")
	@ApiGet({ type: SchoolEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return SchoolEntity.fromPlain(await this.schoolsService.findOne(id));
	}

	/**
	 * Update a school by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: SchoolEntity })
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateSchoolDto: UpdateSchoolDto
	) {
		return SchoolEntity.fromPlain(
			await this.schoolsService.update(id, updateSchoolDto)
		);
	}

	/**
	 * Delete a school by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: SchoolEntity })
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return SchoolEntity.fromPlain(await this.schoolsService.remove(id));
	}
}
