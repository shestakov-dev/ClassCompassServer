import { ApiSchema } from "@nestjs/swagger";
import { School } from "@prisma/client";

@ApiSchema({
	description: "A school object",
})
export class SchoolEntity implements School {
	constructor(partial: Partial<SchoolEntity>) {
		Object.assign(this, partial);
	}

	/**
	 * The school's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The school's name
	 * @example "School A"
	 */
	name: string;

	/**
	 * The time the school was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the school was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the school has been deleted
	 * @example false
	 * @default false
	 */
	deleted: boolean = false;

	/**
	 * The time the school was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 * @default null
	 */
	deletedAt: Date | null = null;
}
