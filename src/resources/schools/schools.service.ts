import { Injectable } from "@nestjs/common";

import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

@Injectable()
export class SchoolsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly ketoService: KetoService
	) {}

	async create(createSchoolDto: CreateSchoolDto, identityId: string) {
		const newSchool = await this.prisma.client.school.create({
			data: createSchoolDto,
		});

		// Make the creator an admin of the school
		await this.addAdmin(newSchool.id, identityId);

		return newSchool;
	}

	findAll() {
		return this.prisma.client.school.findMany();
	}

	findOne(id: string) {
		return this.prisma.client.school.findUniqueOrThrow({
			where: { id },
		});
	}

	update(id: string, updateSchoolDto: UpdateSchoolDto) {
		return this.prisma.client.school.update({
			where: { id },
			data: updateSchoolDto,
		});
	}

	remove(id: string) {
		return this.prisma.client.school.softDelete({
			where: { id },
		});
	}

	async ensureExists(id: string) {
		await this.prisma.client.school.ensureExists(id);
	}

	private async addMember(schoolId: string, identityId: string) {
		await this.ketoService.createRelationship({
			namespace: "School",
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async removeMember(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: "School",
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async addAdmin(schoolId: string, identityId: string) {
		await this.ketoService.createRelationship({
			namespace: "School",
			object: schoolId,
			relation: "admins",
			subjectId: identityId,
		});
	}

	private async removeAdmin(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: "School",
			object: schoolId,
			relation: "admins",
			subjectId: identityId,
		});
	}
}
