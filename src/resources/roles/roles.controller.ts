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
	 * Required attributes: "role:create" or "role:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "role:read" or "role:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "role:read" or "role:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "role:update" or "role:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
	 * Required attributes: "role:delete" or "role:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
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
