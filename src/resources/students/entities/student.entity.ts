import { ApiSchema } from "@nestjs/swagger";
import { Student } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { ClassEntity } from "@resources/classes/entities/class.entity";
import { UserEntity } from "@resources/users/entities/user.entity";

@ApiSchema({
	description: "A student object",
})
export class StudentEntity implements Student {
	static fromPlain(plain: Partial<StudentEntity>): StudentEntity {
		return plainToInstance(StudentEntity, plain, {
			exposeDefaultValues: true,
		});
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
	 * The student's populated user
	 */
	@Type(() => UserEntity)
	user?: UserEntity;

	/**
	 * The student's class identifier
	 * @example "550e8400-e29b-41d4-a716-446655440002"
	 */
	classId: string;

	/**
	 * The student's populated class
	 */
	@Type(() => ClassEntity)
	class?: ClassEntity;

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
	 */
	deleted: boolean = false;

	/**
	 * The time the student was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
