import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from "@nestjs/common";

import { UserEntity } from "@resources/users/entities/user.entity";

import { IdentityId } from "@shared/decorators/identity-id.decorator";

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

		return schools.map(school => SchoolEntity.fromPlain(school));
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

	/**
	 * Promote a member to admin in a school
	 */
	@Post(":id/admins/:userId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiPost({
		type: undefined,
		successResponse: HttpStatus.NO_CONTENT,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	async promoteToAdmin(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("userId", ParseUUIDPipe) userId: string
	) {
		await this.schoolsService.promoteToAdmin(id, userId);
	}

	/**
	 * Get all admins of a school
	 */
	@Get(":id/admins")
	@ApiGet({ type: [UserEntity] })
	async getAdmins(@Param("id", ParseUUIDPipe) id: string) {
		const admins = await this.schoolsService.getAdmins(id);

		return admins.map(admin => UserEntity.fromPlain(admin));
	}

	/**
	 * Check if a user is an admin in a school
	 */
	@Get(":id/admins/:userId")
	@ApiGet({ type: Boolean })
	async isAdmin(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("userId", ParseUUIDPipe) userId: string
	) {
		return this.schoolsService.isAdmin(id, userId);
	}

	/**
	 * Demote an admin to member in a school
	 */
	@Delete(":id/admins/:userId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiDelete({ type: undefined, successResponse: HttpStatus.NO_CONTENT })
	async demoteFromAdmin(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("userId", ParseUUIDPipe) userId: string,
		@IdentityId() callerIdentityId: string
	) {
		await this.schoolsService.demoteFromAdmin(id, userId, callerIdentityId);
	}
}
