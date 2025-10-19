import { ApiSchema } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A class object",
})
export class ClassEntity implements Class {
	static fromPlain(plain: Partial<ClassEntity>): ClassEntity {
		return plainToInstance(ClassEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The class's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The class's name
	 * @example "Class 11B"
	 */
	name: string;

	/**
	 * The class's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	schoolId: string;

	/**
	 * The time the class was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the class was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the class has been deleted
	 * @example false
	 * @default false
	 */
	deleted: boolean = false;

	/**
	 * The time the class was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 * @default null
	 */
	deletedAt: Date | null = null;
}
