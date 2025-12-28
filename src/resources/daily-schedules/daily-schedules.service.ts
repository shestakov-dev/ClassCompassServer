import { Injectable } from "@nestjs/common";

import { ClassesService } from "@resources/classes/classes.service";
import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateDailyScheduleDto } from "./dto/create-daily-schedule.dto";
import { UpdateDailyScheduleDto } from "./dto/update-daily-schedule.dto";

@Injectable()
export class DailySchedulesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly classesService: ClassesService,
		private readonly ketoService: KetoService
	) {}

	async create(createDailyScheduleDto: CreateDailyScheduleDto) {
		await this.classesService.ensureExists(createDailyScheduleDto.classId);

		const newDailySchedule = await this.prisma.client.dailySchedule.create({
			data: createDailyScheduleDto,
		});

		// Add parent class relationship
		await this.addParentClass(
			newDailySchedule.id,
			newDailySchedule.classId
		);

		return newDailySchedule;
	}

	async findAllByClass(classId: string) {
		await this.classesService.ensureExists(classId);

		return this.prisma.client.dailySchedule.findMany({
			where: { classId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.dailySchedule.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateDailyScheduleDto: UpdateDailyScheduleDto) {
		if (updateDailyScheduleDto.classId) {
			await this.classesService.ensureExists(
				updateDailyScheduleDto.classId
			);
		}

		return this.prisma.client.dailySchedule.update({
			where: { id },
			data: updateDailyScheduleDto,
		});
	}

	async remove(id: string) {
		const removedDailySchedule =
			await this.prisma.client.dailySchedule.delete({
				where: { id },
			});

		// Remove parent class relationship
		await this.removeParentClass(
			removedDailySchedule.id,
			removedDailySchedule.classId
		);

		return removedDailySchedule;
	}

	async ensureExists(id: string) {
		await this.prisma.client.dailySchedule.ensureExists(id);
	}

	private async addParentClass(dailyScheduleId: string, classId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.DailySchedule,
			dailyScheduleId,
			classId
		);
	}

	private async removeParentClass(dailyScheduleId: string, classId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.DailySchedule,
			dailyScheduleId,
			classId
		);
	}
}
