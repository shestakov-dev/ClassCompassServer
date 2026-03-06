import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsUUID, Validate, ValidateIf } from "class-validator";

import { IsAfterConstraint } from "@shared/validators/date-constraints";

import { normalizeDate } from "../utils/dates";

@ApiSchema({
	description: "The data required to create a new lesson",
})
export class CreateLessonDto {
	/**
	 * The lesson's start time.
	 * The date is normalized to
	 * 1970-01-01 (epoch) by the server.
	 * @example "1970-01-01T09:00:00Z"
	 */
	@IsDate()
	@Type(() => Date)
	@Transform(({ value }) => normalizeDate(value))
	startTime: Date;

	/**
	 * The lesson's end time.
	 * Must be strictly after `startTime`.
	 * The date is normalized to
	 * 1970-01-01 (epoch) by the server.
	 * @example "1970-01-01T10:00:00Z"
	 */
	@IsDate()
	@Type(() => Date)
	@Transform(({ value }) => normalizeDate(value))
	@ValidateIf(dto => !!dto.startTime)
	@Validate(IsAfterConstraint, ["startTime"])
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
