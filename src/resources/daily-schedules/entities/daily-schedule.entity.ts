import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { $Enums, DailySchedule } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { ClassEntity } from "@resources/classes/entities/class.entity";

@ApiSchema({
	description: "A daily schedule object",
})
export class DailyScheduleEntity implements DailySchedule {
	static fromPlain(plain: Partial<DailyScheduleEntity>): DailyScheduleEntity {
		return plainToInstance(DailyScheduleEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The daily schedule's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The day of the week for the schedule
	 * @example "tuesday"
	 */
	@ApiProperty({ enum: $Enums.Day })
	day: $Enums.Day;

	/**
	 * The daily schedule's class identifier
	 * @example "550e8400-e29b-41d4-a716-446655440002"
	 */
	classId: string;

	/**
	 * The daily schedule's populated class
	 */
	@Type(() => ClassEntity)
	class?: ClassEntity;

	/**
	 * The time the daily schedule was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the daily schedule was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the daily schedule has been deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The time the daily schedule was deleted
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
