import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
} from "@nestjs/common";
import { Day, LessonWeek, Prisma } from "@prisma/client";

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

import {
	getDayFromDate,
	getWeekParityFromDate,
	normalizeDate,
} from "./utils/dates";
import { getTimeFilter } from "./utils/time-filter";

@Injectable()
export class LessonsService {
	private readonly logger = new Logger(LessonsService.name);

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

		const dailySchedule = await this.dailySchedulesService.findOrCreate({
			classId: createLessonDto.classId,
			day: createLessonDto.day,
		});

		const startTime = normalizeDate(createLessonDto.startTime);
		const endTime = normalizeDate(createLessonDto.endTime);

		await this.checkOverlap({
			startTime,
			endTime,
			lessonWeek: createLessonDto.lessonWeek ?? LessonWeek.every,
			roomId: createLessonDto.roomId,
			teacherId: createLessonDto.teacherId,
			dailyScheduleId: dailySchedule.id,
		});

		// discard classId and day from the DTO since they are not part of the lesson model
		const { classId, day, ...lessonData } = createLessonDto;

		const newLesson = await this.prisma.client.lesson.create({
			data: {
				...lessonData,
				startTime,
				endTime,
				dailyScheduleId: dailySchedule.id,
			},
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

		try {
			await this.addParentClass(
				newLesson.id,
				newLesson.dailySchedule.classId
			);
		} catch (error) {
			await this.prisma.client.lesson.delete({
				where: { id: newLesson.id },
			});

			throw error;
		}

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

		if (to && !from) {
			throw new BadRequestException(
				'"from" is required when "to" is provided'
			);
		}

		let timeFilter: Prisma.LessonWhereInput = {};

		// When a timestamp or range is provided, we derive the day and week
		// from the date portion of those timestamps.

		// When only day/week params are given (weekly mode or full-day date mode),
		// we use those directly.

		let effectiveDay: Day | undefined = undefined;
		let effectiveWeek: LessonWeek | undefined = undefined;

		if (from && to) {
			const normalizedFrom = normalizeDate(from);
			const normalizedTo = normalizeDate(to);

			timeFilter = getTimeFilter(normalizedFrom, normalizedTo, true);

			effectiveDay = getDayFromDate(from);

			if (!ignoreWeek) {
				effectiveWeek = getWeekParityFromDate(from);
			}
		} else if (timestamp) {
			const normalizedTime = normalizeDate(timestamp);

			timeFilter = getTimeFilter(normalizedTime, normalizedTime, true);

			effectiveDay = getDayFromDate(timestamp);

			if (!ignoreWeek) {
				effectiveWeek = getWeekParityFromDate(timestamp);
			}
		} else {
			effectiveDay = day;

			if (!ignoreWeek && week) {
				effectiveWeek = week;
			}
		}

		const where: Prisma.LessonWhereInput = {
			// Only get lessons for the resolved day
			// and for classes in the specified school
			dailySchedule: {
				is: {
					day: effectiveDay,
					classId,
					class: {
						schoolId,
					},
				},
			},

			// Filter by week parity when a specific week type has been resolved.
			// "odd" or "even" also includes "every" lessons (they recur on all weeks).
			lessonWeek:
				effectiveWeek === undefined
					? undefined
					: { in: [effectiveWeek, LessonWeek.every] },

			// Apply time filtering based on a timestamp or from/to range
			...timeFilter,

			// Apply additional optional filters
			subjectId,
			roomId,
			teacherId,
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

		if (updateLessonDto.startTime) {
			updateLessonDto.startTime = normalizeDate(
				updateLessonDto.startTime
			);
		}

		if (updateLessonDto.endTime) {
			updateLessonDto.endTime = normalizeDate(updateLessonDto.endTime);
		}

		const existingLesson = await this.findOne(id);

		const oldDailyScheduleId = existingLesson.dailyScheduleId;
		const oldClassId = existingLesson.dailySchedule.classId;

		// Resolve daily schedule from classId/day if either is being changed
		let resolvedDailyScheduleId = oldDailyScheduleId;

		if (
			updateLessonDto.classId !== undefined ||
			updateLessonDto.day !== undefined
		) {
			const newClassId =
				updateLessonDto.classId ?? existingLesson.dailySchedule.classId;
			const newDay =
				updateLessonDto.day ?? existingLesson.dailySchedule.day;

			const dailySchedule = await this.dailySchedulesService.findOrCreate(
				{
					classId: newClassId,
					day: newDay,
				}
			);

			resolvedDailyScheduleId = dailySchedule.id;
		}

		await this.checkOverlap({
			startTime: updateLessonDto.startTime ?? existingLesson.startTime,
			endTime: updateLessonDto.endTime ?? existingLesson.endTime,
			lessonWeek: updateLessonDto.lessonWeek ?? existingLesson.lessonWeek,
			roomId: updateLessonDto.roomId ?? existingLesson.roomId,
			teacherId: updateLessonDto.teacherId ?? existingLesson.teacherId,
			dailyScheduleId: resolvedDailyScheduleId,
			excludeLessonId: id,
		});

		// discard classId and day from the DTO since they are not part of the lesson model
		const { classId, day, ...lessonData } = updateLessonDto;

		const updatedLesson = await this.prisma.client.lesson.update({
			where: { id },
			data: { ...lessonData, dailyScheduleId: resolvedDailyScheduleId },
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

		const newClassId = updatedLesson.dailySchedule.classId;

		if (newClassId !== oldClassId) {
			try {
				await this.replaceParentClass(id, oldClassId, newClassId);
			} catch (error) {
				try {
					await this.prisma.client.lesson.update({
						where: { id },
						data: {
							startTime: existingLesson.startTime,
							endTime: existingLesson.endTime,
							lessonWeek: existingLesson.lessonWeek,
							roomId: existingLesson.roomId,
							teacherId: existingLesson.teacherId,
							subjectId: existingLesson.subjectId,
							dailyScheduleId: oldDailyScheduleId,
						},
					});
				} catch (rollbackError) {
					this.logger.error(
						"Failed to rollback lesson:",
						rollbackError
					);

					throw rollbackError;
				}

				if (resolvedDailyScheduleId !== oldDailyScheduleId) {
					try {
						await this.cleanupDailyScheduleIfEmpty(
							resolvedDailyScheduleId
						);
					} catch (cleanupError) {
						this.logger.error(
							"Failed to cleanup daily schedule after lesson rollback:",
							cleanupError
						);
					}
				}

				throw error;
			}
		}

		// If the daily schedule changed, clean up the old one if it's now empty
		if (resolvedDailyScheduleId !== oldDailyScheduleId) {
			await this.cleanupDailyScheduleIfEmpty(oldDailyScheduleId);
		}

		return updatedLesson;
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

		await this.cleanupDailyScheduleIfEmpty(removedLesson.dailyScheduleId);

		await this.removeParentClass(
			removedLesson.id,
			removedLesson.dailySchedule.classId
		);

		return removedLesson;
	}

	private async cleanupDailyScheduleIfEmpty(dailyScheduleId: string) {
		const remainingLessons = await this.prisma.client.lesson.count({
			where: { dailyScheduleId },
		});

		if (remainingLessons === 0) {
			await this.dailySchedulesService.remove(dailyScheduleId);
		}
	}

	private async addParentClass(lessonId: string, classId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Lesson,
			lessonId,
			classId
		);
	}

	private async removeParentClass(lessonId: string, classId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Lesson,
			lessonId,
			classId
		);
	}

	private async replaceParentClass(
		lessonId: string,
		oldClassId: string,
		newClassId: string
	) {
		await this.ketoService.replaceRelationship(
			{
				namespace: KetoNamespace.Lesson,
				object: lessonId,
				relation: "parentClass",
				subjectSet: {
					namespace: KetoNamespace.Class,
					object: oldClassId,
				},
			},
			{
				namespace: KetoNamespace.Lesson,
				object: lessonId,
				relation: "parentClass",
				subjectSet: {
					namespace: KetoNamespace.Class,
					object: newClassId,
				},
			}
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
						dailySchedule: { day },
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
