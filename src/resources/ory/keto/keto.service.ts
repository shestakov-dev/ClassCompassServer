import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	Configuration,
	PermissionApi,
	Relationship,
	RelationshipApi,
} from "@ory/keto-client";
import { AxiosError } from "axios";

export interface KetoTuple {
	namespace: string;
	object: string;
	relation: string;
	subjectId?: string;
	subjectSet?: {
		namespace: string;
		object: string;
		relation?: string;
	};
}

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

	async createRelationship(tuple: KetoTuple): Promise<void> {
		try {
			const relationship = this.mapTupleToRelationship(tuple);

			await this.relationApi.createRelationship({
				createRelationshipBody: relationship,
			});
		} catch (error) {
			this.handleKetoError(error, "create");
		}
	}

	async deleteRelationship(tuple: KetoTuple): Promise<void> {
		try {
			await this.relationApi.deleteRelationships({
				namespace: tuple.namespace,
				object: tuple.object,
				relation: tuple.relation,
				subjectId: tuple.subjectId,
				subjectSetNamespace: tuple.subjectSet?.namespace,
				subjectSetObject: tuple.subjectSet?.object,
				subjectSetRelation: tuple.subjectSet?.relation,
			});
		} catch (error) {
			this.handleKetoError(error, "delete");
		}
	}

	async checkPermission(
		namespace: string,
		object: string,
		relation: string,
		subjectId?: string
	): Promise<boolean> {
		try {
			const response = await this.permissionApi.checkPermission({
				namespace,
				object,
				relation,
				subjectId,
			});
			return response.data.allowed;
		} catch (error) {
			this.handleKetoError(error, "check permission");

			// Unreachable due to throw, but satisfies TS
			return false;
		}
	}

	async createObjectLink(
		namespace: string,
		object: string,
		relation: string,
		parentNamespace: string,
		parentObject: string
	) {
		return this.createRelationship({
			namespace,
			object,
			relation,
			subjectSet: {
				namespace: parentNamespace,
				object: parentObject,
			},
		});
	}

	async deleteObjectLink(
		namespace: string,
		object: string,
		relation: string,
		parentNamespace: string,
		parentObject: string
	) {
		return this.deleteRelationship({
			namespace,
			object,
			relation,
			subjectSet: {
				namespace: parentNamespace,
				object: parentObject,
			},
		});
	}

	private mapTupleToRelationship(tuple: KetoTuple): Relationship {
		const relationship: Relationship = {
			namespace: tuple.namespace,
			object: tuple.object,
			relation: tuple.relation,
		};

		if (tuple.subjectId) {
			relationship.subject_id = tuple.subjectId;
		} else if (tuple.subjectSet) {
			relationship.subject_set = {
				namespace: tuple.subjectSet.namespace,
				object: tuple.subjectSet.object,
				relation: tuple.subjectSet.relation ?? "",
			};
		} else {
			throw new Error("Either subjectId or subjectSet must be provided");
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
