import { ApiSchema } from "@nestjs/swagger";
import { Teacher } from "@prisma/client";
import { plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A teacher object",
})
export class TeacherEntity implements Teacher {
	static fromPlain(plain: Partial<TeacherEntity>): TeacherEntity {
		return plainToInstance(TeacherEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The teacher's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The teacher's user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	userId: string;

	/**
	 * The teacher's subject identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440000"]
	 */
	subjectIds?: string[] = [];

	/**
	 * The time the teacher was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the teacher was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the teacher has been deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The time the teacher was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
