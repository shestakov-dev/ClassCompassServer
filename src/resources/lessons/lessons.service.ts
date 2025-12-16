import { BadRequestException, Injectable } from "@nestjs/common";
import { Day, LessonWeek, Prisma } from "@prisma/client";
import { getDay, getISOWeek } from "date-fns";

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

import { normalizeDate } from "./utils/dates";

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
		const {
			timestamp,
			from,
			to,
			classId,
			subjectId,
			roomId,
			teacherId,
			ignoreWeek,
		} = filters;

		let referenceDate: Date;
		let timeFilter: Prisma.LessonWhereInput;

		if (from && to) {
			referenceDate = from;

			const normalizedFrom = normalizeDate(from);

			const normalizedTo = normalizeDate(to);

			timeFilter = {
				startTime: { lte: normalizedTo },
				endTime: { gte: normalizedFrom },
			};
		} else if (timestamp) {
			referenceDate = timestamp;

			const normalizedTime = normalizeDate(timestamp);

			timeFilter = {
				startTime: { lte: normalizedTime },
				endTime: { gte: normalizedTime },
			};
		} else {
			throw new BadRequestException(
				`Either "timestamp" or both "from" and "to" must be provided`
			);
		}

		// Calculate day & week using the provided timestamp
		const dayIndex = getDay(referenceDate);
		const currentDay = this.DAY_MAPPING[dayIndex];

		const isoWeek = getISOWeek(referenceDate);
		const currentWeek =
			isoWeek % 2 === 0 ? LessonWeek.even : LessonWeek.odd;

		const where: Prisma.LessonWhereInput = {
			subjectId,
			roomId,
			teacherId,

			// Apply time filtering based on a timestamp or from/to range
			...timeFilter,

			// The lesson must be scheduled for the current week
			// or every week unless ignoreWeek is true
			lessonWeek: ignoreWeek
				? undefined
				: { in: [currentWeek, LessonWeek.every] },

			// Only get lessons for the current day
			// and for classes in the specified school
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
