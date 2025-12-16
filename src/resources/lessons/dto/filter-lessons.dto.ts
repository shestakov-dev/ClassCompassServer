import { ApiSchema } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional, IsUUID } from "class-validator";

@ApiSchema({
	description: "The filters for querying lessons at a specific time",
})
export class FilterLessonsDto {
	/**
	 * The timestamp to filter lessons by;
	 * The date part is used to determine the week and day,
	 * the time part is used to filter lessons occurring at that time
	 * @example "2023-03-15T09:30:00Z"
	 */
	@IsDate()
	@Type(() => Date)
	timestamp: Date;

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
