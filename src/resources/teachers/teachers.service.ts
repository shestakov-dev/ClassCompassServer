import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
import { SchoolsService } from "@resources/schools/schools.service";
import { SubjectsService } from "@resources/subjects/subjects.service";
import { UsersService } from "@resources/users/users.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

@Injectable()
export class TeachersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		@Inject(forwardRef(() => SubjectsService))
		private readonly subjectsService: SubjectsService,
		private readonly schoolsService: SchoolsService,
		private readonly ketoService: KetoService
	) {}

	async create(createTeacherDto: CreateTeacherDto) {
		await this.usersService.ensureExists(createTeacherDto.userId);

		if (createTeacherDto.subjectIds) {
			await this.subjectsService.ensureExistsMany(
				createTeacherDto.subjectIds
			);
		}

		const teacher = await this.prisma.client.teacher.create({
			data: {
				// remove subjectIds from the dto to avoid unknown field error
				...{ ...createTeacherDto, subjectIds: undefined },
				subjects: {
					connect:
						createTeacherDto.subjectIds?.map(id => ({ id })) ?? [],
				},
			},
			include: {
				subjects: true,
				user: true,
			},
		});

		await this.addParentUser(teacher.id, createTeacherDto.userId);

		return teacher;
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.teacher.findMany({
			where: { user: { schoolId } },
			include: {
				subjects: true,
				user: true,
			},
		});
	}

	async findOne(id: string) {
		return this.prisma.client.teacher.findUniqueOrThrow({
			where: { id },
			include: {
				subjects: true,
				user: true,
			},
		});
	}

	async update(id: string, updateTeacherDto: UpdateTeacherDto) {
		if (updateTeacherDto.userId) {
			await this.usersService.ensureExists(updateTeacherDto.userId);
		}

		if (updateTeacherDto.subjectIds) {
			await this.subjectsService.ensureExistsMany(
				updateTeacherDto.subjectIds
			);
		}

		return this.prisma.client.teacher.update({
			where: { id },
			data: {
				// remove subjectIds from the dto to avoid unknown field error
				...{ ...updateTeacherDto, subjectIds: undefined },
				subjects: updateTeacherDto.subjectIds
					? {
							set: updateTeacherDto.subjectIds.map(id => ({
								id,
							})),
						}
					: undefined,
			},
			include: {
				subjects: true,
				user: true,
			},
		});
	}

	async remove(id: string) {
		const teacher = await this.prisma.client.teacher.delete({
			where: { id },
			include: {
				subjects: true,
				user: true,
			},
		});

		await this.removeParentUser(teacher.id, teacher.userId);

		return teacher;
	}

	async ensureExists(id: string) {
		await this.prisma.client.teacher.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.teacher.ensureExistsMany(ids);
	}

	private async addParentUser(teacherId: string, userId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Teacher,
			teacherId,
			userId
		);
	}

	private async removeParentUser(teacherId: string, userId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Teacher,
			teacherId,
			userId
		);
	}
}
