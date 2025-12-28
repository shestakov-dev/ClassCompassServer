import { ConflictException, Injectable } from "@nestjs/common";
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
import { getTimeFilter } from "./utils/time-filter";

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

		await this.checkOverlap({
			startTime: createLessonDto.startTime,
			endTime: createLessonDto.endTime,
			lessonWeek: createLessonDto.lessonWeek ?? LessonWeek.every,
			roomId: createLessonDto.roomId,
			teacherId: createLessonDto.teacherId,
			dailyScheduleId: createLessonDto.dailyScheduleId,
		});

		const newLesson = await this.prisma.client.lesson.create({
			data: createLessonDto,
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
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
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
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
			day,
			week,
		} = filters;

		let timeFilter: Prisma.LessonWhereInput = {};
		let dayFilter: Day | undefined;
		let weekFilter: LessonWeek | undefined;

		if (from && to) {
			const referenceDate = from;

			const normalizedFrom = normalizeDate(from);
			const normalizedTo = normalizeDate(to);

			timeFilter = getTimeFilter(normalizedFrom, normalizedTo, true);

			const dayIndex = getDay(referenceDate);
			dayFilter = this.DAY_MAPPING[dayIndex];

			const isoWeek = getISOWeek(referenceDate);
			weekFilter = isoWeek % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
		} else if (timestamp) {
			const referenceDate = timestamp;

			const normalizedTime = normalizeDate(timestamp);

			timeFilter = getTimeFilter(normalizedTime, normalizedTime, true);

			const dayIndex = getDay(referenceDate);
			dayFilter = this.DAY_MAPPING[dayIndex];

			const isoWeek = getISOWeek(referenceDate);
			weekFilter = isoWeek % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
		} else {
			dayFilter = day;
			weekFilter = week;
		}

		const where: Prisma.LessonWhereInput = {
			subjectId,
			roomId,
			teacherId,

			// Apply time filtering based on a timestamp or from/to range
			...timeFilter,

			// The lesson must be scheduled for the current week
			// or every week unless ignoreWeek is true
			lessonWeek:
				ignoreWeek || !weekFilter
					? undefined
					: { in: [weekFilter, LessonWeek.every] },

			// Only get lessons for the current day
			// and for classes in the specified school
			dailySchedule: {
				is: {
					day: dayFilter,
					classId,
					class: {
						schoolId,
					},
				},
			},
		};

		return this.prisma.client.lesson.findMany({
			where,
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
		});
	}

	findOne(id: string) {
		return this.prisma.client.lesson.findUniqueOrThrow({
			where: { id },
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
		});
	}

	async update(id: string, updateLessonDto: UpdateLessonDto) {
		if (updateLessonDto.roomId) {
			await this.roomsService.ensureExists(updateLessonDto.roomId);
		}

		if (updateLessonDto.teacherId) {
			await this.teachersService.ensureExists(updateLessonDto.teacherId);
		}

		if (updateLessonDto.subjectId) {
			await this.subjectsService.ensureExists(updateLessonDto.subjectId);
		}

		if (updateLessonDto.dailyScheduleId) {
			await this.dailySchedulesService.ensureExists(
				updateLessonDto.dailyScheduleId
			);
		}

		const existingLesson = await this.findOne(id);

		await this.checkOverlap({
			startTime: updateLessonDto.startTime ?? existingLesson.startTime,
			endTime: updateLessonDto.endTime ?? existingLesson.endTime,
			lessonWeek: updateLessonDto.lessonWeek ?? existingLesson.lessonWeek,
			roomId: updateLessonDto.roomId ?? existingLesson.roomId,
			teacherId: updateLessonDto.teacherId ?? existingLesson.teacherId,
			dailyScheduleId:
				updateLessonDto.dailyScheduleId ??
				existingLesson.dailyScheduleId,
			excludeLessonId: id,
		});

		return this.prisma.client.lesson.update({
			where: { id },
			data: updateLessonDto,
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
		});
	}

	async remove(id: string) {
		const removedLesson = await this.prisma.client.lesson.delete({
			where: { id },
			include: {
				room: true,
				teacher: {
					include: { user: true },
				},
				subject: true,
				dailySchedule: {
					include: { class: true },
				},
			},
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

	private async checkOverlap({
		startTime,
		endTime,
		lessonWeek,
		roomId,
		teacherId,
		dailyScheduleId,
		excludeLessonId,
	}: {
		startTime: Date;
		endTime: Date;
		lessonWeek: LessonWeek;
		roomId: string;
		teacherId: string;
		dailyScheduleId: string;
		excludeLessonId?: string;
	}) {
		// Get the day of the week for the schedule
		const { day } =
			await this.dailySchedulesService.findOne(dailyScheduleId);

		// Determine weeks that could conflict
		const conflictingWeeks: LessonWeek[] = [LessonWeek.every];

		if (lessonWeek === LessonWeek.every) {
			conflictingWeeks.push(LessonWeek.odd, LessonWeek.even);
		} else {
			conflictingWeeks.push(lessonWeek);
		}

		const conflictingLesson = await this.prisma.client.lesson.findFirst({
			where: {
				AND: [
					{ id: { not: excludeLessonId } },
					{
						OR: [{ roomId }, { teacherId }, { dailyScheduleId }],
					},
					{
						dailySchedule: {
							day: day,
						},
					},
					{
						lessonWeek: { in: conflictingWeeks },
					},
					getTimeFilter(startTime, endTime),
				],
			},
		});

		if (conflictingLesson) {
			throw new ConflictException(
				"Lesson overlaps with an existing lesson for the same room, teacher, or class."
			);
		}
	}
}
