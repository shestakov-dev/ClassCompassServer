import { ApiSchema } from "@nestjs/swagger";
import { Student } from "@prisma/client";

@ApiSchema({
	description: "A student object",
})
export class StudentEntity implements Student {
	constructor(partial: Partial<StudentEntity>) {
		Object.assign(this, partial);
	}

	/**
	 * The student's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The student's user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	userId: string;

	/**
	 * The student's class identifier
	 * @example "550e8400-e29b-41d4-a716-446655440002"
	 */
	classId: string;

	/**
	 * The time the student was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the student was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the student has been deleted
	 * @example false
	 * @default false
	 */
	deleted: boolean = false;

	/**
	 * The time the student was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 * @default null
	 */
	deletedAt: Date | null = null;
}
