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
	@Auth("Access token", {
		OR: ["role:create", "role:*"],
	})
	async create(@Body() createRoleDto: CreateRoleDto) {
		return RoleEntity.fromPlain(
			await this.rolesService.create(createRoleDto)
		);
	}

	/**
	 * Get all roles for a school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [RoleEntity] })
	@Auth("Access token", {
		OR: ["role:read", "role:*"],
	})
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const roles = await this.rolesService.findAllBySchool(schoolId);

		return roles.map(role => RoleEntity.fromPlain(role));
	}

	/**
	 * Get a role by ID
	 */
	@Get(":id")
	@ApiGet({ type: RoleEntity })
	@Auth("Access token", {
		OR: ["role:read", "role:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return RoleEntity.fromPlain(await this.rolesService.findOne(id));
	}

	/**
	 * Update a role by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: RoleEntity })
	@Auth("Access token", {
		OR: ["role:update", "role:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateRoleDto: UpdateRoleDto
	) {
		return RoleEntity.fromPlain(
			await this.rolesService.update(id, updateRoleDto)
		);
	}

	/**
	 * Delete a role by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: RoleEntity })
	@Auth("Access token", {
		OR: ["role:delete", "role:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return RoleEntity.fromPlain(await this.rolesService.remove(id));
	}
}
