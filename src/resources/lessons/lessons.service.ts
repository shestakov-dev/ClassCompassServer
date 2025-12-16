import { Injectable } from "@nestjs/common";
import { Day, LessonWeek, Prisma } from "@prisma/client";
import { getDay, getISOWeek, set } from "date-fns";

import { DailySchedulesService } from "@resources/daily-schedules/daily-schedules.service";
import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { RoomsService } from "@resources/rooms/rooms.service";
import { SubjectsService } from "@resources/subjects/subjects.service";
import { TeachersService } from "@resources/teachers/teachers.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateLessonDto } from "./dto/create-lesson.dto";
import { FilterLessonsDto } from "./dto/filter-lessons.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

@Injectable()
export class LessonsService {
	// Define mapping for date-fns getDay (0=Sunday) to Prisma Day Enum
	private readonly DAY_MAPPING: Day[] = [
		Day.sunday,
		Day.monday,
		Day.tuesday,
		Day.wednesday,
		Day.thursday,
		Day.friday,
		Day.saturday,
	];

	constructor(
		private readonly prisma: PrismaService,
		private readonly roomsService: RoomsService,
		private readonly teachersService: TeachersService,
		private readonly subjectsService: SubjectsService,
		private readonly dailySchedulesService: DailySchedulesService,
		private readonly ketoService: KetoService
	) {}

	async create(createLessonDto: CreateLessonDto) {
		await this.roomsService.ensureExists(createLessonDto.roomId);
		await this.teachersService.ensureExists(createLessonDto.teacherId);
		await this.subjectsService.ensureExists(createLessonDto.subjectId);
		await this.dailySchedulesService.ensureExists(
			createLessonDto.dailyScheduleId
		);

		// TODO: Check for conflicts (e.g., same teacher or room at the same time)

		const newLesson = await this.prisma.client.lesson.create({
			data: createLessonDto,
		});

		// Add parent daily schedule relationship
		await this.addParentDailySchedule(
			newLesson.id,
			newLesson.dailyScheduleId
		);

		return newLesson;
	}

	async findAllByDailySchedule(dailyScheduleId: string) {
		await this.dailySchedulesService.ensureExists(dailyScheduleId);

		return this.prisma.client.lesson.findMany({
			where: { dailyScheduleId },
		});
	}

	async findAllBySchool(schoolId: string, filters: FilterLessonsDto) {
		const { timestamp, classId, subjectId, roomId, teacherId, ignoreWeek } =
			filters;

		// Calculate day & week using the provided timestamp
		const dayIndex = getDay(timestamp);
		const currentDay = this.DAY_MAPPING[dayIndex];

		const isoWeek = getISOWeek(timestamp);
		const currentWeek =
			isoWeek % 2 === 0 ? LessonWeek.even : LessonWeek.odd;

		// Normalize timestamp to 1970-01-01 for time comparison later
		// This ensures we compare the time portion only
		const timeOnlyTimestamp = set(timestamp, {
			year: 1970,
			month: 0, // January is 0
			date: 1,
		});

		const where: Prisma.LessonWhereInput = {
			subjectId,
			roomId,
			teacherId,

			// The time must be within the lesson's start and end time
			startTime: { lte: timeOnlyTimestamp },
			endTime: { gte: timeOnlyTimestamp },

			// The lesson must be scheduled for the current week
			// or every week unless ignoreWeek is true
			lessonWeek: ignoreWeek
				? undefined
				: { in: [currentWeek, LessonWeek.every] },

			// DailySchedule relation filters (Class and Day)
			dailySchedule: {
				is: {
					day: currentDay,
					classId,
					class: {
						schoolId,
					},
				},
			},
		};

		return this.prisma.client.lesson.findMany({ where });
	}

	findOne(id: string) {
		return this.prisma.client.lesson.findUniqueOrThrow({
			where: { id },
		});
	}

	update(id: string, updateLessonDto: UpdateLessonDto) {
		if (updateLessonDto.roomId) {
			this.roomsService.ensureExists(updateLessonDto.roomId);
		}

		if (updateLessonDto.teacherId) {
			this.teachersService.ensureExists(updateLessonDto.teacherId);
		}

		if (updateLessonDto.subjectId) {
			this.subjectsService.ensureExists(updateLessonDto.subjectId);
		}

		if (updateLessonDto.dailyScheduleId) {
			this.dailySchedulesService.ensureExists(
				updateLessonDto.dailyScheduleId
			);
		}

		// TODO: Check for conflicts (e.g., same teacher or room at the same time)

		return this.prisma.client.lesson.update({
			where: { id },
			data: updateLessonDto,
		});
	}

	async remove(id: string) {
		const removedLesson = await this.prisma.client.lesson.softDelete({
			where: { id },
		});

		// Remove parent daily schedule relationship
		await this.removeParentDailySchedule(
			removedLesson.id,
			removedLesson.dailyScheduleId
		);

		return removedLesson;
	}

	private async addParentDailySchedule(
		lessonId: string,
		dailyScheduleId: string
	) {
		await this.ketoService.linkChild(
			KetoNamespace.Lesson,
			lessonId,
			dailyScheduleId
		);
	}

	private async removeParentDailySchedule(
		lessonId: string,
		dailyScheduleId: string
	) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Lesson,
			lessonId,
			dailyScheduleId
		);
	}
}
