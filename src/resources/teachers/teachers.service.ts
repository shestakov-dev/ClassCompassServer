import { forwardRef, Inject, Injectable } from "@nestjs/common";

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
		private readonly subjectsService: SubjectsService
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
				subjects: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...teacher,
			subjects: undefined,
			subjectIds: teacher.subjects.map(subject => subject.id),
		};
	}

	async findOne(id: string) {
		const teacher = await this.prisma.client.teacher.findUniqueOrThrow({
			where: { id },
			include: {
				subjects: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...teacher,
			subjects: undefined,
			subjectIds: teacher.subjects.map(subject => subject.id),
		};
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

		const teacher = await this.prisma.client.teacher.update({
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
				subjects: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...teacher,
			subjects: undefined,
			subjectIds: teacher.subjects.map(subject => subject.id),
		};
	}

	remove(id: string) {
		return this.prisma.client.teacher.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.teacher.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.teacher.ensureExistsMany(ids);
	}
}
