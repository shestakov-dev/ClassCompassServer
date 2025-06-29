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

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

import { RoleEntity } from "./entities/role.entity";

import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	/**
	 * Create a new role
	 */
	@Post()
	@ApiPost({ type: RoleEntity })
	@Attributes({
		OR: ["role:create", "role:*"],
	})
	@ApiBearerAuth("Access Token")
	async create(@Body() createRoleDto: CreateRoleDto) {
		return new RoleEntity(await this.rolesService.create(createRoleDto));
	}

	/**
	 * Get all roles for a school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [RoleEntity] })
	@Attributes({
		OR: ["role:read", "role:*"],
	})
	@ApiBearerAuth("Access Token")
	async findAllBySchool(
		@Param("schoolId", ObjectIdValidationPipe) schoolId: string
	) {
		const roles = await this.rolesService.findAllBySchool(schoolId);

		return roles.map(role => new RoleEntity(role));
	}

	/**
	 * Get a role by ID
	 */
	@Get(":id")
	@ApiGet({ type: RoleEntity })
	@Attributes({
		OR: ["role:read", "role:*"],
	})
	@ApiBearerAuth("Access Token")
	async findOne(@Param("id", ObjectIdValidationPipe) id: string) {
		return new RoleEntity(await this.rolesService.findOne(id));
	}

	/**
	 * Update a role by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: RoleEntity })
	@Attributes({
		OR: ["role:update", "role:*"],
	})
	@ApiBearerAuth("Access Token")
	async update(
		@Param("id", ObjectIdValidationPipe) id: string,
		@Body() updateRoleDto: UpdateRoleDto
	) {
		return new RoleEntity(
			await this.rolesService.update(id, updateRoleDto)
		);
	}

	/**
	 * Delete a role by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: RoleEntity })
	@Attributes({
		OR: ["role:delete", "role:*"],
	})
	@ApiBearerAuth("Access Token")
	async remove(@Param("id", ObjectIdValidationPipe) id: string) {
		return new RoleEntity(await this.rolesService.remove(id));
	}
}
