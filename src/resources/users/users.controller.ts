import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";

import { ApiDelete, ApiGet, ApiPatch, ApiPost, Auth } from "@decorators";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { UserEntity } from "./entities/user.entity";

import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/**
	 * Create a new user
	 */
	@Post()
	@ApiPost({ type: UserEntity })
	@Auth("Access token", {
		OR: ["user:create", "user:*"],
	})
	async create(@Body() createUserDto: CreateUserDto) {
		return UserEntity.fromPlain(
			await this.usersService.create(createUserDto)
		);
	}

	/**
	 * Get all users for a school
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [UserEntity] })
	@Auth("Access token", {
		OR: ["user:read", "user:*"],
	})
	async findAllBySchool(@Param("schoolId") schoolId: string) {
		const users = await this.usersService.findAllBySchool(schoolId);

		return users.map(user => UserEntity.fromPlain(user));
	}

	/**
	 * Get a user by ID
	 */
	@Get(":id")
	@ApiGet({ type: UserEntity })
	@Auth("Access token", {
		OR: ["user:read", "user:*"],
	})
	async findOne(@Param("id") id: string) {
		return UserEntity.fromPlain(await this.usersService.findOne(id));
	}

	/**
	 * Update a user by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: UserEntity })
	@Auth("Access token", {
		OR: ["user:update", "user:*"],
	})
	async update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto
	) {
		return UserEntity.fromPlain(
			await this.usersService.update(id, updateUserDto)
		);
	}

	/**
	 * Delete a user by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: UserEntity })
	@Auth("Access token", {
		OR: ["user:delete", "user:*"],
	})
	async remove(@Param("id") id: string) {
		return UserEntity.fromPlain(await this.usersService.remove(id));
	}
}
