import { ApiSchema } from "@nestjs/swagger";
import { Subject } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { SchoolEntity } from "@resources/schools/entities/school.entity";
import { TeacherEntity } from "@resources/teachers/entities/teacher.entity";

@ApiSchema({
	description: "A subject object",
})
export class SubjectEntity implements Subject {
	static fromPlain(plain: Partial<SubjectEntity>): SubjectEntity {
		return plainToInstance(SubjectEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The subject's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The subject's name
	 * @example "Mathematics"
	 */
	name: string;

	/**
	 * The subject's associated school
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	schoolId: string;

	/**
	 * The subject's populated school
	 */
	@Type(() => SchoolEntity)
	school?: SchoolEntity;

	/**
	 * The subject's teacher identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440000"]
	 */
	teacherIds?: string[] = [];

	/**
	 * The subject's populated teachers
	 */
	@Type(() => TeacherEntity)
	teachers?: TeacherEntity[] = [];

	/**
	 * The subject's creation date
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The subject's last update date
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the subject is deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The subject's deletion date
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
