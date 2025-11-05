import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { SchoolsService } from "@resources/schools/schools.service";
import { TeachersService } from "@resources/teachers/teachers.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

@Injectable()
export class SubjectsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		@Inject(forwardRef(() => TeachersService))
		private readonly teachersService: TeachersService
	) {}

	async create(createSubjectDto: CreateSubjectDto) {
		await this.schoolsService.ensureExists(createSubjectDto.schoolId);

		if (createSubjectDto.teacherIds) {
			await this.teachersService.ensureExistsMany(
				createSubjectDto.teacherIds
			);
		}

		const subject = await this.prisma.client.subject.create({
			data: {
				// remove teacherIds from the dto to avoid unknown field error
				...{ ...createSubjectDto, teacherIds: undefined },
				teachers: {
					connect:
						createSubjectDto.teacherIds?.map(id => ({ id })) ?? [],
				},
			},
			include: {
				teachers: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...subject,
			teachers: undefined,
			teacherIds: subject.teachers.map(teacher => teacher.id),
		};
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		const subjects = await this.prisma.client.subject.findMany({
			where: { schoolId },
			include: {
				teachers: { select: { id: true }, where: { deleted: false } },
			},
		});

		return subjects.map(subject => ({
			...subject,
			teachers: undefined,
			teacherIds: subject.teachers.map(teacher => teacher.id),
		}));
	}

	async findOne(id: string) {
		const subject = await this.prisma.client.subject.findUniqueOrThrow({
			where: { id },
			include: {
				teachers: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...subject,
			teachers: undefined,
			teacherIds: subject.teachers.map(teacher => teacher.id),
		};
	}

	async update(id: string, updateSubjectDto: UpdateSubjectDto) {
		if (updateSubjectDto.schoolId) {
			await this.schoolsService.ensureExists(updateSubjectDto.schoolId);
		}

		if (updateSubjectDto.teacherIds) {
			await this.teachersService.ensureExistsMany(
				updateSubjectDto.teacherIds
			);
		}

		const subject = await this.prisma.client.subject.update({
			where: { id },
			data: {
				// remove teacherIds from the dto to avoid unknown field error
				...{ ...updateSubjectDto, teacherIds: undefined },
				teachers: updateSubjectDto.teacherIds
					? {
							set: updateSubjectDto.teacherIds.map(id => ({
								id,
							})),
						}
					: undefined,
			},
			include: {
				teachers: { select: { id: true }, where: { deleted: false } },
			},
		});

		return {
			...subject,
			teachers: undefined,
			teacherIds: subject.teachers.map(teacher => teacher.id),
		};
	}

	remove(id: string) {
		return this.prisma.client.subject.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.subject.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.subject.ensureExistsMany(ids);
	}
}
