import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums, Lesson } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { DailyScheduleEntity } from "@resources/daily-schedules/entities/daily-schedule.entity";
import { RoomEntity } from "@resources/rooms/entities/room.entity";
import { SubjectEntity } from "@resources/subjects/entities/subject.entity";
import { TeacherEntity } from "@resources/teachers/entities/teacher.entity";

@ApiSchema({
	description: "A lesson object",
})
export class LessonEntity implements Lesson {
	static fromPlain(plain: Partial<LessonEntity>): LessonEntity {
		return plainToInstance(LessonEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The lesson's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The lesson's start time
	 * @example "2023-03-15T09:00:00Z"
	 */
	startTime: Date;

	/**
	 * The lesson's end time
	 * @example "2023-03-15T10:00:00Z"
	 */
	endTime: Date;

	/**
	 * The lesson's week
	 * @example "odd"
	 */
	@ApiProperty({ enum: $Enums.LessonWeek })
	lessonWeek: $Enums.LessonWeek;

	/**
	 * The lesson's room identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	roomId: string;

	/**
	 * The lesson's populated room
	 */
	@Type(() => RoomEntity)
	room?: RoomEntity;

	/**
	 * The lesson's teacher identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	teacherId: string;

	/**
	 * The lesson's populated teacher
	 */
	@Type(() => TeacherEntity)
	teacher?: TeacherEntity;

	/**
	 * The lesson's subject identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	subjectId: string;

	/**
	 * The lesson's populated subject
	 */
	@Type(() => SubjectEntity)
	subject?: SubjectEntity;

	/**
	 * The lesson's daily schedule identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	dailyScheduleId: string;

	/**
	 * The lesson's populated daily schedule
	 */
	@Type(() => DailyScheduleEntity)
	dailySchedule?: DailyScheduleEntity;

	/**
	 * The time the lesson was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the lesson was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;
}
