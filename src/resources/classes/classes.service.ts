import { Injectable } from "@nestjs/common";

import { KetoService } from "@resources/ory/keto/keto.service";
import { SchoolsService } from "@resources/schools/schools.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

@Injectable()
export class ClassesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly schoolsService: SchoolsService,
		private readonly ketoService: KetoService
	) {}

	async create(createClassDto: CreateClassDto) {
		await this.schoolsService.ensureExists(createClassDto.schoolId);

		const newClass = await this.prisma.client.class.create({
			data: createClassDto,
		});

		// Add parent school relationship
		await this.addParentSchool(newClass.id, createClassDto.schoolId);

		return newClass;
	}

	async findAllBySchool(schoolId: string) {
		await this.schoolsService.ensureExists(schoolId);

		return this.prisma.client.class.findMany({
			where: { schoolId },
		});
	}

	findOne(id: string) {
		return this.prisma.client.class.findUniqueOrThrow({
			where: { id },
		});
	}

	async update(id: string, updateClassDto: UpdateClassDto) {
		if (updateClassDto.schoolId) {
			await this.schoolsService.ensureExists(updateClassDto.schoolId);
		}

		return this.prisma.client.class.update({
			where: { id },
			data: updateClassDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.class.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.class.ensureExists(id);
	}

	private async addParentSchool(classId: string, schoolId: string) {
		await this.ketoService.createRelationship({
			namespace: "Class",
			object: classId,
			relation: "parentSchool",
			subjectSet: {
				namespace: "School",
				object: schoolId,
			},
		});
	}

	private async removeParentSchool(classId: string, schoolId: string) {
		await this.ketoService.deleteRelationship({
			namespace: "Class",
			object: classId,
			relation: "parentSchool",
			subjectSet: {
				namespace: "School",
				object: schoolId,
			},
		});
	}
}
