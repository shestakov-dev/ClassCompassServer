import { ApiSchema } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A role object",
})
export class RoleEntity implements Role {
	static fromPlain(plain: Partial<RoleEntity>): RoleEntity {
		return plainToInstance(RoleEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The role's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The role's name
	 * @example "Admin"
	 */
	name: string;

	/**
	 * The role's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	schoolId: string;

	/**
	 * The role's attributes
	 * @example ["subject:read", "dailySchedule:update"]
	 */
	attributes: string[] = [];

	/**
	 * The role's user identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"]
	 */
	userIds: string[] = [];

	/**
	 * The time the role was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the role was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the role has been deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The time the role was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
