import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

import { IsValidAttribute } from "@decorators";

@ApiSchema({
	description: "The data required to create a new role",
})
export class CreateRoleDto {
	/**
	 * The role's name
	 * @example "Admin"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The role's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	schoolId: string;

	/**
	 * The role's attributes
	 * @example ["subject:read", "dailySchedule:update"]
	 */
	@IsValidAttribute({ each: true })
	attributes: string[] = [];

	/**
	 * The role's user identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
	 */
	@IsUUID(4, { each: true })
	userIds: string[] = [];
}
