import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsUUID } from "class-validator";

import { normalizeDate } from "../utils/dates";

@ApiSchema({
	description: "The data required to create a new lesson",
})
export class CreateLessonDto {
	/**
	 * The lesson's number in the daily schedule
	 * @example 1
	 */
	@IsNumber()
	lessonNumber: number;

	/**
	 * The lesson's start time
	 * @example "2023-03-15T09:00:00Z"
	 */
	@IsDate()
	@Type(() => Date)
	@Transform(({ value }) => normalizeDate(value))
	startTime: Date;

	/**
	 * The lesson's end time
	 * @example "2023-03-15T10:00:00Z"
	 */
	@IsDate()
	@Type(() => Date)
	@Transform(({ value }) => normalizeDate(value))
	endTime: Date;

	/**
	 * The lesson's week
	 * @example "odd"
	 */
	@IsEnum($Enums.LessonWeek)
	@ApiProperty({ enum: $Enums.LessonWeek })
	lessonWeek?: $Enums.LessonWeek = "every";

	/**
	 * The lesson's room identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	roomId: string;

	/**
	 * The lesson's teacher identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	teacherId: string;

	/**
	 * The lesson's subject identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	subjectId: string;

	/**
	 * The lesson's daily schedule identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	dailyScheduleId: string;
}
