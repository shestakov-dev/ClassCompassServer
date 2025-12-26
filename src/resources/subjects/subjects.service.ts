import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";
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
		private readonly teachersService: TeachersService,
		private readonly ketoService: KetoService
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
				teachers: { where: { deleted: false } },
			},
		});

		// Add parent school relationship
		await this.addParentSchool(subject.id, createSubjectDto.schoolId);

		return subject;
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.subject.findMany({
			where: { schoolId },
			include: {
				teachers: { where: { deleted: false } },
			},
		});
	}

	async findOne(id: string) {
		return this.prisma.client.subject.findUniqueOrThrow({
			where: { id },
			include: {
				teachers: { where: { deleted: false } },
			},
		});
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

		return this.prisma.client.subject.update({
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
				teachers: { where: { deleted: false } },
			},
		});
	}

	async remove(id: string) {
		const newSubject = await this.prisma.client.subject.softDelete({
			where: { id },
			include: {
				teachers: { where: { deleted: false } },
			},
		});

		// Remove parent school relationship
		await this.removeParentSchool(newSubject.id, newSubject.schoolId);

		return newSubject;
	}

	async ensureExists(id: string) {
		await this.prisma.client.subject.ensureExists(id);
	}

	async ensureExistsMany(ids: string[]) {
		await this.prisma.client.subject.ensureExistsMany(ids);
	}

	private async addParentSchool(subjectId: string, schoolId: string) {
		await this.ketoService.linkChild(
			KetoNamespace.Subject,
			subjectId,
			schoolId
		);
	}

	private async removeParentSchool(subjectId: string, schoolId: string) {
		await this.ketoService.unlinkChild(
			KetoNamespace.Subject,
			subjectId,
			schoolId
		);
	}
}
