import { ApiSchema, PartialType } from "@nestjs/swagger";

import { CreateDailyScheduleDto } from "./create-daily-schedule.dto";

@ApiSchema({
	description: "The data required to update a daily schedule",
})
export class UpdateDailyScheduleDto extends PartialType(
	CreateDailyScheduleDto
) {}
