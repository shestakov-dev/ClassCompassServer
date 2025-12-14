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
	@KetoPermission<CreateUserDto>({
		namespace: KetoNamespace.School,
		relation: "manage",
		source: "body",
		key: "schoolId",
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
	async findAllBySchool(@Param("schoolId", ParseUUIDPipe) schoolId: string) {
		const users = await this.usersService.findAllBySchool(schoolId);

		return users.map(user => UserEntity.fromPlain(user));
	}

	/**
	 * Get a user by ID
	 */
	@Get(":id")
	@ApiGet({ type: UserEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return UserEntity.fromPlain(await this.usersService.findOne(id));
	}

	/**
	 * Update a user by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: UserEntity })
	async update(
		@Param("id", ParseUUIDPipe) id: string,
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return UserEntity.fromPlain(await this.usersService.remove(id));
	}
}
