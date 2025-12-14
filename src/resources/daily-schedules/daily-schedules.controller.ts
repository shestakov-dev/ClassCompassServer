import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";

import { KetoPermission } from "@shared/decorators/keto-permission.decorator";

import { ApiDelete, ApiGet, ApiPatch, ApiPost } from "@decorators";

import { CreateDailyScheduleDto } from "./dto/create-daily-schedule.dto";
import { UpdateDailyScheduleDto } from "./dto/update-daily-schedule.dto";

import { DailyScheduleEntity } from "./entities/daily-schedule.entity";

import { DailySchedulesService } from "./daily-schedules.service";

@Controller("daily-schedules")
export class DailySchedulesController {
	constructor(
		private readonly dailySchedulesService: DailySchedulesService
	) {}

	/**
	 * Create a new daily schedule
	 */
	@Post()
	@ApiPost({ type: DailyScheduleEntity })
	@KetoPermission<CreateDailyScheduleDto>({
		namespace: KetoNamespace.Class,
		relation: "manage",
		source: "body",
		key: "classId",
	})
	async create(@Body() createDailyScheduleDto: CreateDailyScheduleDto) {
		return DailyScheduleEntity.fromPlain(
			await this.dailySchedulesService.create(createDailyScheduleDto)
		);
	}

	/**
	 * Get all daily schedules for a class
	 */
	@Get("class/:classId")
	@ApiGet({ type: [DailyScheduleEntity] })
	async findAllByClass(@Param("classId", ParseUUIDPipe) classId: string) {
		const dailySchedules =
			await this.dailySchedulesService.findAllByClass(classId);

		return dailySchedules.map(schedule =>
			DailyScheduleEntity.fromPlain(schedule)
		);
	}

	/**
	 * Get a daily schedule by ID
	 */
	@Get(":id")
	@ApiGet({ type: DailyScheduleEntity })
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return DailyScheduleEntity.fromPlain(
			await this.dailySchedulesService.findOne(id)
		);
	}

	/**
	 * Update a daily schedule by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: DailyScheduleEntity })
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateDailyScheduleDto: UpdateDailyScheduleDto
	) {
		return DailyScheduleEntity.fromPlain(
			await this.dailySchedulesService.update(id, updateDailyScheduleDto)
		);
	}

	/**
	 * Delete a daily schedule by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: DailyScheduleEntity })
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return DailyScheduleEntity.fromPlain(
			await this.dailySchedulesService.remove(id)
		);
	}
}
