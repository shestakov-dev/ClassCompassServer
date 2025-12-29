import { Injectable } from "@nestjs/common";

import { ClassesService } from "@resources/classes/classes.service";
import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { UsersService } from "@resources/users/users.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		private readonly classesService: ClassesService,
		private readonly ketoService: KetoService
	) {}

	async create(createStudentDto: CreateStudentDto) {
		await this.usersService.ensureExists(createStudentDto.userId);
		await this.classesService.ensureExists(createStudentDto.classId);

		const student = await this.prisma.client.student.create({
			data: createStudentDto,
		});

		await this.addParentUser(student.id, createStudentDto.userId);

		return student;
	}

	async findAllByClass(classId: string) {
		await this.classesService.ensureExists(classId);

		return this.prisma.client.student.findMany({
			where: { classId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.student.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateStudentDto: UpdateStudentDto) {
		if (updateStudentDto.userId) {
			await this.usersService.ensureExists(updateStudentDto.userId);
		}

		if (updateStudentDto.classId) {
			await this.classesService.ensureExists(updateStudentDto.classId);
		}

		return this.prisma.client.student.update({
			where: { id },
			data: updateStudentDto,
		});
	}

	async remove(id: string) {
		const student = await this.prisma.client.student.delete({
			where: { id },
		});

		await this.removeParentUser(student.id, student.userId);

		return student;
	}

	private async addParentUser(studentId: string, userId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Student,
			studentId,
			userId
		);
	}

	private async removeParentUser(studentId: string, userId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Student,
			studentId,
			userId
		);
	}
}
