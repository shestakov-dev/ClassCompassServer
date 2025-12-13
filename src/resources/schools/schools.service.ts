import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { KetoNamespace } from "@resources/ory/keto/definitions";
import { KetoService } from "@resources/ory/keto/keto.service";

import { PrismaService } from "@prisma/prisma.service";

import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

@Injectable()
export class SchoolsService {
	private readonly platformObjectId: string;

	constructor(
		private readonly prisma: PrismaService,
		private readonly ketoService: KetoService,
		private readonly configService: ConfigService
	) {
		this.platformObjectId =
			this.configService.getOrThrow<string>("PLATFORM_OBJECT_ID");
	}

	async create(createSchoolDto: CreateSchoolDto) {
		const newSchool = await this.prisma.client.school.create({
			data: createSchoolDto,
		});

		await this.addParentPlatform(newSchool.id, this.platformObjectId);

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

	async remove(id: string) {
		const newSchool = await this.prisma.client.school.softDelete({
			where: { id },
		});

		// Remove parent platform relationship
		await this.removeParentPlatform(newSchool.id, this.platformObjectId);

		return newSchool;
	}

	async ensureExists(id: string) {
		await this.prisma.client.school.ensureExists(id);
	}

	private async addMember(schoolId: string, identityId: string) {
		await this.ketoService.createRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async removeMember(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "members",
			subjectId: identityId,
		});
	}

	private async addAdmin(schoolId: string, identityId: string) {
		await this.ketoService.createRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "admins",
			subjectId: identityId,
		});
	}

	private async removeAdmin(schoolId: string, identityId: string) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "admins",
			subjectId: identityId,
		});
	}

	private async addParentPlatform(schoolId: string, platformId: string) {
		await this.ketoService.createRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "parentPlatform",
			subjectSet: {
				namespace: KetoNamespace.Platform,
				object: platformId,
			},
		});
	}

	private async removeParentPlatform(schoolId: string, platformId: string) {
		await this.ketoService.deleteRelationship({
			namespace: KetoNamespace.School,
			object: schoolId,
			relation: "parentPlatform",
			subjectSet: {
				namespace: KetoNamespace.Platform,
				object: platformId,
			},
		});
	}
}
