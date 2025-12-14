import { ApiSchema } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Exclude, plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A user object",
})
export class UserEntity implements User {
	static fromPlain(plain: Partial<UserEntity>): UserEntity {
		return plainToInstance(UserEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The user's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The user's Kratos identity ID
	 * @example "550e8400-e29b-41d4-a716-446655440002"
	 */
	@Exclude()
	identityId: string;

	/**
	 * The user's first name
	 * @example "John"
	 */
	firstName: string;

	/**
	 * The user's last name
	 * @example "Doe"
	 */
	lastName: string;

	/**
	 * The user's email
	 * @example "johndoe@example.com"
	 */
	email: string;

	/**
	 * The user's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	schoolId: string;

	/**
	 * The time the user was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the user was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the user has been deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The time the user was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
