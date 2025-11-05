import { Injectable } from "@nestjs/common";

import { DailySchedulesService } from "@resources/daily-schedules/daily-schedules.service";
import { RoomsService } from "@resources/rooms/rooms.service";
import { SubjectsService } from "@resources/subjects/subjects.service";
import { TeachersService } from "@resources/teachers/teachers.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

@Injectable()
export class LessonsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly roomsService: RoomsService,
		private readonly teachersService: TeachersService,
		private readonly subjectsService: SubjectsService,
		private readonly dailySchedulesService: DailySchedulesService
	) {}

	async create(createLessonDto: CreateLessonDto) {
		await this.roomsService.ensureExists(createLessonDto.roomId);
		await this.teachersService.ensureExists(createLessonDto.teacherId);
		await this.subjectsService.ensureExists(createLessonDto.subjectId);
		await this.dailySchedulesService.ensureExists(
			createLessonDto.dailyScheduleId
		);

		// TODO: Check for conflicts (e.g., same teacher or room at the same time)

		return this.prisma.client.lesson.create({
			data: createLessonDto,
		});
	}

	async findAllByDailySchedule(dailyScheduleId: string) {
		await this.dailySchedulesService.ensureExists(dailyScheduleId);

		return this.prisma.client.lesson.findMany({
			where: { dailyScheduleId },
		});
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

	remove(id: string) {
		return this.prisma.client.lesson.softDelete({
			where: { id },
		});
	}
}
