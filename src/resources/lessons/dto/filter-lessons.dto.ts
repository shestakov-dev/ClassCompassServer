import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsDate,
	IsDefined,
	IsEnum,
	IsOptional,
	IsUUID,
	Validate,
	ValidateIf,
} from "class-validator";

import {
	IsAfterConstraint,
	IsNotSetWithConstraint,
} from "@shared/validators/date-constraints";

// Fields that should be optional overall but required in the presence of a
// sibling are validated here at the DTO level where possible.  The case
// of `to` being supplied without `from` is a logical error that is rejected
// at the service level (see findAllBySchool) to keep the DTO decorators clean.
@ApiSchema({
	description: "Filter lessons by various criteria",
})
export class FilterLessonsDto {
	/**
	 * A specific point-in-time to match lessons against.
	 *
	 * The date portion is used to derive the day-of-week and week parity
	 * (odd/even) for filtering — the frontend does not need to send those
	 * separately.  The time portion is matched against lesson start/end times
	 * stored as 1970-01-01 epoch values.
	 *
	 * Mutually exclusive with `from`/`to`.
	 *
	 * @example "2023-03-15T09:30:00Z" (parsed as Wednesday, odd week, at 09:30)
	 */
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@ValidateIf(dto => !!dto.timestamp)
	@Validate(IsNotSetWithConstraint, ["from", "to"])
	timestamp?: Date;

	/**
	 * Start of a time range to match lessons against.
	 *
	 * Like `timestamp`, the date portion is used to derive the day-of-week
	 * and week parity for filtering.  Must be provided together with `to`.
	 * Mutually exclusive with `timestamp`.
	 *
	 * @example "2023-03-13T08:00:00Z"
	 */
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@ValidateIf(dto => !!dto.from)
	@Validate(IsNotSetWithConstraint, ["timestamp"])
	from?: Date;

	/**
	 * End of a time range to match lessons against.
	 *
	 * Must be provided together with `from` and must represent a time
	 * strictly after `from`.  Only the time portion is used for the
	 * overlap check. the date portion of `from` is used for day/week
	 * derivation. Mutually exclusive with `timestamp`.
	 *
	 * @example "2023-03-13T17:00:00Z"
	 */
	@ValidateIf(dto => !!dto.from)
	@IsDefined({ message: '"to" is required when "from" is provided' })
	@IsDate()
	@Type(() => Date)
	@Validate(IsAfterConstraint, ["from"])
	@Validate(IsNotSetWithConstraint, ["timestamp"])
	to?: Date;

	/**
	 * The day of the week to filter lessons by.
	 *
	 * Used in weekly mode and full-day date mode.  When `timestamp` or
	 * `from`/`to` are provided, the backend derives the day from the date
	 * portion of those fields and this param is ignored.
	 *
	 * @example "tuesday"
	 */
	@IsOptional()
	@IsEnum($Enums.Day)
	@ApiProperty({ enum: $Enums.Day })
	day?: $Enums.Day;

	/**
	 * The week parity to filter lessons by.
	 *
	 * Used in weekly mode and full-day date mode.  When `timestamp` or
	 * `from`/`to` are provided, the backend derives the parity from the
	 * ISO week number of those dates and this param is ignored.
	 *
	 * Leave undefined (omit the parameter) to show all week types — that
	 * is the default behaviour.
	 *
	 * @example "odd"
	 */
	@IsOptional()
	@IsEnum($Enums.LessonWeek)
	@ApiProperty({ enum: $Enums.LessonWeek })
	week?: $Enums.LessonWeek;

	/**
	 * Whether to ignore the lesson week when filtering.
	 *
	 * In timestamp/range date modes the backend auto-derives week parity
	 * from the timestamp's ISO week number.  Set this to true to suppress
	 * that derivation and return lessons of all week types.
	 *
	 * In weekly mode this has no effect — omit `week` (leave it undefined)
	 * to show all week types instead.
	 *
	 * @example false
	 */
	@IsOptional()
	@IsBoolean()
	// Query params arrive as strings; coerce "true"/"false" to booleans.
	@Transform(({ value }) => value === "true" || value === true)
	ignoreWeek?: boolean = false;

	/**
	 * The class identifier to filter lessons by
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsOptional()
	@IsUUID()
	classId?: string;

	/**
	 * The subject identifier to filter lessons by
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsOptional()
	@IsUUID()
	subjectId?: string;

	/**
	 * The room identifier to filter lessons by
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsOptional()
	@IsUUID()
	roomId?: string;

	/**
	 * The teacher identifier to filter lessons by
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsOptional()
	@IsUUID()
	teacherId?: string;
}
