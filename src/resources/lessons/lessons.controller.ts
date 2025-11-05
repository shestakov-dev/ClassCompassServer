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

import { ApiDelete, ApiGet, ApiPatch, ApiPost, Auth } from "@decorators";

import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

import { LessonEntity } from "./entities/lesson.entity";

import { LessonsService } from "./lessons.service";

@Controller("lessons")
export class LessonsController {
	constructor(private readonly lessonsService: LessonsService) {}

	/**
	 * Create a new lesson
	 */
	@Post()
	@ApiPost({ type: LessonEntity })
	@Auth("Access token", {
		OR: ["lesson:create", "lesson:*"],
	})
	async create(@Body() createLessonDto: CreateLessonDto) {
		return LessonEntity.fromPlain(
			await this.lessonsService.create(createLessonDto)
		);
	}

	/**
	 * Get all lessons for a daily schedule
	 */
	@Get("daily-schedule/:dailyScheduleId")
	@ApiGet({ type: [LessonEntity] })
	@Auth("Access token", {
		OR: ["lesson:read", "lesson:*"],
	})
	async findAllByDailySchedule(
		@Param("dailyScheduleId", ParseUUIDPipe) dailyScheduleId: string
	) {
		const lessons =
			await this.lessonsService.findAllByDailySchedule(dailyScheduleId);

		return lessons.map(lesson => LessonEntity.fromPlain(lesson));
	}

	/**
	 * Get a lesson by ID
	 */
	@Get(":id")
	@ApiGet({ type: LessonEntity })
	@Auth("Access token", {
		OR: ["lesson:read", "lesson:*"],
	})
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return LessonEntity.fromPlain(await this.lessonsService.findOne(id));
	}

	/**
	 * Update a lesson by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: LessonEntity })
	@Auth("Access token", {
		OR: ["lesson:update", "lesson:*"],
	})
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateLessonDto: UpdateLessonDto
	) {
		return LessonEntity.fromPlain(
			await this.lessonsService.update(id, updateLessonDto)
		);
	}

	/**
	 * Delete a lesson by ID
	 */
	@Delete(":id")
	@ApiDelete({ type: LessonEntity })
	@Auth("Access token", {
		OR: ["lesson:delete", "lesson:*"],
	})
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return LessonEntity.fromPlain(await this.lessonsService.remove(id));
	}
}
