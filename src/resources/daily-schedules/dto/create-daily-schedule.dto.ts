import { ApiSchema } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new daily schedule",
})
export class CreateDailyScheduleDto {
	/**
	 * The day of the week for the schedule
	 * @example "tuesday"
	 */
	@IsEnum($Enums.Day)
	day: $Enums.Day;

	/**
	 * The daily schedule's class identifier
	 * @example "550e8400-e29b-41d4-a716-446655440002"
	 */
	@IsUUID()
	classId: string;
}
