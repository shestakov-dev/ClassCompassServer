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
	private readonly relationApi: RelationshipApi;
	private readonly permissionApi: PermissionApi;

	constructor(private readonly configService: ConfigService) {
		const ketoReadUrl =
			this.configService.getOrThrow<string>("KETO_READ_URL");

		const ketoWriteUrl =
			this.configService.getOrThrow<string>("KETO_WRITE_URL");

		this.relationApi = new RelationshipApi(
			new Configuration({ basePath: ketoWriteUrl })
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

			await this.relationApi.createRelationship({
				createRelationshipBody: relationship,
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

			await this.relationApi.deleteRelationships(relationship);
		} catch (error) {
			this.handleKetoError(error, "delete");
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
		if (error instanceof AxiosError && error.response) {
			console.error(
				`Failed to ${action} Keto tuple:`,
				error.response.data || error.message
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
