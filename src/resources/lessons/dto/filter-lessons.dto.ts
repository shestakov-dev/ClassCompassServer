import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsOptional,
	IsUUID,
	Validate,
	ValidateIf,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsAfter", async: false })
class IsAfterConstraint implements ValidatorConstraintInterface {
	validate(propertyValue: string, args: ValidationArguments) {
		return propertyValue > (args.object as any)[args.constraints[0]];
	}
	defaultMessage(args: ValidationArguments) {
		return `"${args.property}" must be after "${args.constraints[0]}"`;
	}
}

@ApiSchema({
	description: "Filter lessons by various criteria",
})
export class FilterLessonsDto {
	/**
	 * The timestamp to filter lessons by;
	 * The date part is used to determine the week and day,
	 * the time part is used to filter lessons occurring at that time
	 * @example "2023-03-15T09:30:00Z"
	 */
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	timestamp?: Date;

	/**
	 * The start date to filter lessons from;
	 * Lessons occurring on or after this date will be included
	 * @example "2023-03-13T00:00:00Z"
	 */
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	from?: Date;

	/**
	 * The end date to filter lessons to;
	 * Lessons occurring on or before this date will be included
	 * @example "2023-03-19T23:59:59Z"
	 */
	// Only validate 'to' if 'from' exists
	@ValidateIf(dto => dto.from)
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@Validate(IsAfterConstraint, ["from"])
	to?: Date;

	/**
	 * The day of the week to filter lessons by
	 * @example "tuesday"
	 */
	@IsOptional()
	@IsEnum($Enums.Day)
	@ApiProperty({ enum: $Enums.Day })
	day?: $Enums.Day;

	/**
	 * The week parity to filter lessons by
	 * @example "odd"
	 */
	@IsOptional()
	@IsEnum($Enums.LessonWeek)
	@ApiProperty({ enum: $Enums.LessonWeek })
	week?: $Enums.LessonWeek;

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

	/**
	 * Whether to ignore the lesson week when filtering
	 * @example false
	 */
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	ignoreWeek?: boolean = false;
}
