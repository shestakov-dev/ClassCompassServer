import { Injectable } from "@nestjs/common";

import { DailySchedulesService } from "@resources/daily-schedules/daily-schedules.service";
import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
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
		await this.ketoService.createRelationship({
			namespace: KetoNamespace.Lesson,
			object: lessonId,
			relation: "parentDailySchedule",
			subjectSet: {
				namespace: KetoNamespace.DailySchedule,
				object: dailyScheduleId,
			},
		});
	}

	private async removeParentDailySchedule(
		lessonId: string,
		dailyScheduleId: string
	) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.Lesson,
			object: lessonId,
			relation: "parentDailySchedule",
			subjectSet: {
				namespace: KetoNamespace.DailySchedule,
				object: dailyScheduleId,
			},
		});
	}
}
