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

import { ApiDelete, ApiGet, ApiPatch, ApiPost, Attributes } from "@decorators";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { UserEntity } from "./entities/user.entity";

import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/**
	 * Create a new user
	 * Required attributes: "user:create" or "user:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Post()
	@ApiPost({ type: UserEntity })
	@Attributes({
		OR: ["user:create", "user:*"],
	})
	@ApiBearerAuth("Access Token")
	async create(@Body() createUserDto: CreateUserDto) {
		return new UserEntity(await this.usersService.create(createUserDto));
	}

	/**
	 * Get all users for a school
	 * Required attributes: "user:read" or "user:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [UserEntity] })
	@Attributes({
		OR: ["user:read", "user:*"],
	})
	@ApiBearerAuth("Access Token")
	async findAllBySchool(@Param("schoolId") schoolId: string) {
		const users = await this.usersService.findAllBySchool(schoolId);

		return users.map(user => new UserEntity(user));
	}

	/**
	 * Get a user by ID
	 * Required attributes: "user:read" or "user:*"
	 * Requires a valid access token. The user must have the required attributes to access this resource.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Get(":id")
	@ApiGet({ type: UserEntity })
	@Attributes({
		OR: ["user:read", "user:*"],
	})
	@ApiBearerAuth("Access Token")
	async findOne(@Param("id") id: string) {
		return new UserEntity(await this.usersService.findOne(id));
	}

	/**
	 * Update a user by ID
	 * Required attributes: "user:update" or "user:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Patch(":id")
	@ApiPatch({ type: UserEntity })
	@Attributes({
		OR: ["user:update", "user:*"],
	})
	@ApiBearerAuth("Access Token")
	async update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto
	) {
		return new UserEntity(
			await this.usersService.update(id, updateUserDto)
		);
	}

	/**
	 * Delete a user by ID
	 * Required attributes: "user:delete" or "user:*"
	 * Requires a valid access token. The user must have the required attributes to perform this action.
	 *
	 * Possible 401 Unauthorized: Missing or invalid access token.
	 * Possible 403 Forbidden: Insufficient permissions (missing required attributes).
	 */
	@Delete(":id")
	@ApiDelete({ type: UserEntity })
	@Attributes({
		OR: ["user:delete", "user:*"],
	})
	@ApiBearerAuth("Access Token")
	async remove(@Param("id") id: string) {
		return new UserEntity(await this.usersService.remove(id));
	}
}
