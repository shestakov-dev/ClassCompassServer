import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	Configuration,
	PermissionApi,
	Relationship,
	RelationshipApi,
} from "@ory/keto-client";
import { AxiosError } from "axios";

import {
	KetoCheckTuple,
	KetoChildNamespace,
	KetoHierarchy,
	KetoNamespace,
	KetoWriteTuple,
} from "./definitions";

@Injectable()
export class KetoService {
	private readonly writeRelationApi: RelationshipApi;
	private readonly readRelationApi: RelationshipApi;
	private readonly permissionApi: PermissionApi;

	constructor(private readonly configService: ConfigService) {
		const ketoReadUrl =
			this.configService.getOrThrow<string>("KETO_READ_URL");

		const ketoWriteUrl =
			this.configService.getOrThrow<string>("KETO_WRITE_URL");

		this.writeRelationApi = new RelationshipApi(
			new Configuration({ basePath: ketoWriteUrl })
		);

		this.readRelationApi = new RelationshipApi(
			new Configuration({ basePath: ketoReadUrl })
		);

		this.permissionApi = new PermissionApi(
			new Configuration({ basePath: ketoReadUrl })
		);
	}

	async createRelationship<N extends KetoNamespace>(
		tuple: KetoWriteTuple<N>
	): Promise<void> {
		try {
			const relationship = this.mapTupleToRelationship(tuple);

			await this.writeRelationApi.patchRelationships({
				relationshipPatch: [
					{
						action: "insert",
						relation_tuple: relationship,
					},
				],
			});
		} catch (error) {
			this.handleKetoError(error, "create");
		}
	}

	async deleteRelationship<N extends KetoNamespace>(
		tuple: KetoWriteTuple<N>
	): Promise<void> {
		try {
			const relationship = this.mapTupleToRelationship(tuple);

			await this.writeRelationApi.patchRelationships({
				relationshipPatch: [
					{
						action: "delete",
						relation_tuple: relationship,
					},
				],
			});
		} catch (error) {
			this.handleKetoError(error, "delete");
		}
	}

	async replaceRelationship<N extends KetoNamespace>(
		oldTuple: KetoWriteTuple<N>,
		newTuple: KetoWriteTuple<N>
	): Promise<void> {
		try {
			const oldRelationship = this.mapTupleToRelationship(oldTuple);
			const newRelationship = this.mapTupleToRelationship(newTuple);

			await this.writeRelationApi.patchRelationships({
				relationshipPatch: [
					{
						action: "delete",
						relation_tuple: oldRelationship,
					},
					{
						action: "insert",
						relation_tuple: newRelationship,
					},
				],
			});
		} catch (error) {
			this.handleKetoError(error, "replace");
		}
	}

	async linkChild(
		childNamespace: KetoChildNamespace,
		childId: string,
		parentId: string
	): Promise<void> {
		const hierarchy = KetoHierarchy[childNamespace];

		const tuple: KetoWriteTuple<typeof childNamespace> = {
			namespace: childNamespace,
			object: childId,
			relation: hierarchy.parentRelation,
			subjectSet: {
				namespace: hierarchy.parentNamespace,
				object: parentId,
			},
		};

		await this.createRelationship(tuple);
	}

	async unlinkChild(
		childNamespace: KetoChildNamespace,
		childId: string,
		parentId: string
	): Promise<void> {
		const hierarchy = KetoHierarchy[childNamespace];

		const tuple: KetoWriteTuple<typeof childNamespace> = {
			namespace: childNamespace,
			object: childId,
			relation: hierarchy.parentRelation,
			subjectSet: {
				namespace: hierarchy.parentNamespace,
				object: parentId,
			},
		};

		await this.deleteRelationship(tuple);
	}

	async checkPermission<N extends KetoNamespace>(
		tuple: KetoCheckTuple<N>
	): Promise<boolean> {
		try {
			const response = await this.permissionApi.checkPermission(tuple);

			return response.data.allowed;
		} catch (error) {
			this.handleKetoError(error, "check permission");

			// Unreachable due to throw, but satisfies TS
			return false;
		}
	}

	async getRelationships<N extends KetoNamespace>(
		tuple: Partial<KetoCheckTuple<N>>
	): Promise<Relationship[]> {
		try {
			console.log(tuple);

			const response = await this.readRelationApi.getRelationships(tuple);

			return response.data.relation_tuples ?? [];
		} catch (error) {
			this.handleKetoError(error, "get relationships");

			// Unreachable due to throw, but satisfies TS
			return [];
		}
	}

	private mapTupleToRelationship<N extends KetoNamespace>(
		tuple: KetoWriteTuple<N>
	): Relationship {
		const relationship: Relationship = {
			namespace: tuple.namespace,
			object: tuple.object,
			relation: tuple.relation,
		};

		if ("subjectId" in tuple) {
			relationship.subject_id = tuple.subjectId;
		} else if ("subjectSet" in tuple) {
			relationship.subject_set = {
				// If there is no relation in the subject set, default to empty string
				relation: "",
				...tuple.subjectSet,
			};
		} else {
			throw new InternalServerErrorException(
				"Invalid Keto Tuple: Missing subject"
			);
		}

		return relationship;
	}

	private handleKetoError(error: unknown, action: string) {
		console.log(error);

		if (error instanceof AxiosError && error.response) {
			console.error(
				`Failed to ${action} Keto tuple:`,
				error.response.data ?? error.message
			);
		} else if (error instanceof Error) {
			console.error(
				`Failed to ${action} Keto tuple (Unexpected):`,
				error.message
			);
		}

		throw new InternalServerErrorException(
			`Failed to ${action} permissions`
		);
	}
}
