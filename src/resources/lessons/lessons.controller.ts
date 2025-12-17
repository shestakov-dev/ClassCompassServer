import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";

import { KetoPermission } from "@shared/decorators/keto-permission.decorator";

import { ApiDelete, ApiGet, ApiPatch, ApiPost } from "@decorators";

import { CreateLessonDto } from "./dto/create-lesson.dto";
import { FilterLessonsDto } from "./dto/filter-lessons.dto";
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
	@KetoPermission<CreateLessonDto>({
		namespace: KetoNamespace.DailySchedule,
		relation: "manage",
		source: "body",
		key: "dailyScheduleId",
	})
	async create(@Body() createLessonDto: CreateLessonDto) {
		return LessonEntity.fromPlain(
			await this.lessonsService.create(createLessonDto)
		);
	}

	/**
	 * Get all lessons for a school filtered by various criteria
	 */
	@Get("school/:schoolId")
	@ApiGet({ type: [LessonEntity] })
	async findFiltered(
		@Param("schoolId", ParseUUIDPipe) schoolId: string,
		@Query() filters: FilterLessonsDto
	) {
		const lessons = await this.lessonsService.findAllBySchool(
			schoolId,
			filters
		);

		return lessons.map(lesson => LessonEntity.fromPlain(lesson));
	}

	/**
	 * Get all lessons for a daily schedule
	 */
	@Get("daily-schedule/:dailyScheduleId")
	@ApiGet({ type: [LessonEntity] })
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
	async findOne(@Param("id", ParseUUIDPipe) id: string) {
		return LessonEntity.fromPlain(await this.lessonsService.findOne(id));
	}

	/**
	 * Update a lesson by ID
	 */
	@Patch(":id")
	@ApiPatch({ type: LessonEntity })
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
	async remove(@Param("id", ParseUUIDPipe) id: string) {
		return LessonEntity.fromPlain(await this.lessonsService.remove(id));
	}
}
