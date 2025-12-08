import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	Configuration,
	FrontendApi,
	IdentityApi,
	Session,
} from "@ory/kratos-client";
import { AxiosError } from "axios";

@Injectable()
export class KratosService {
	private readonly identityApi: IdentityApi;
	private readonly frontendApi: FrontendApi;

	constructor(private readonly configService: ConfigService) {
		const kratosAdminUrl =
			this.configService.getOrThrow<string>("KRATOS_ADMIN_URL");

		const kratosPublicUrl =
			this.configService.getOrThrow<string>("KRATOS_PUBLIC_URL");

		this.identityApi = new IdentityApi(
			new Configuration({ basePath: kratosAdminUrl })
		);

		this.frontendApi = new FrontendApi(
			new Configuration({ basePath: kratosPublicUrl })
		);
	}

	async createIdentity(traits: Record<string, unknown>) {
		const response = await this.identityApi.createIdentity({
			createIdentityBody: {
				schema_id: "default",
				traits,
			},
		});

		return response.data;
	}

	async updateIdentity(identityId: string, traits: Record<string, unknown>) {
		const response = await this.identityApi.updateIdentity({
			id: identityId,
			updateIdentityBody: {
				schema_id: "default",
				state: "active",
				traits,
			},
		});

		return response.data;
	}

	async getSession(sessionCookie: string): Promise<Session> {
		const response = await this.frontendApi.toSession({
			cookie: sessionCookie,
		});

		return response.data;
	}

	async extendSession(sessionId: string): Promise<void> {
		const response = await this.identityApi.extendSession({
			id: sessionId,
		});

		// The extension was successful if we get a 200 or 204 response
		if (response.status !== 200 && response.status !== 204) {
			throw new Error(`Failed to extend session ${sessionId}`);
		}
	}

	async identityExists(identityId: string): Promise<boolean> {
		try {
			await this.identityApi.getIdentity({ id: identityId });

			return true;
		} catch (error) {
			if (
				error instanceof AxiosError &&
				error.response &&
				error.response.status === 404
			) {
				return false;
			}

			// If the error was not a 404, rethrow it
			throw error;
		}
	}

	async createRecoveryLink(
		identityId: string,
		returnTo: string
	): Promise<string> {
		try {
			const response =
				await this.identityApi.createRecoveryLinkForIdentity({
					createRecoveryLinkForIdentityBody: {
						identity_id: identityId,
						expires_in: "15m",
					},
					returnTo,
				});

			return response.data.recovery_link;
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				console.error(
					"Error creating recovery link:",
					JSON.stringify(error.response?.data, null, 2)
				);
			} else {
				console.error("An unexpected error occurred:", error);
			}

			throw error;
		}
	}

	async verifyIdentityEmail(identityId: string): Promise<void> {
		if (!this.identityExists(identityId)) {
			throw new NotFoundException("Identity not found");
		}

		await this.identityApi.patchIdentity({
			id: identityId,
			jsonPatch: [
				{
					op: "replace",
					path: "/verifiable_addresses/0/status",
					value: "completed",
				},
				{
					op: "replace",
					path: "/verifiable_addresses/0/verified",
					value: true,
				},
			],
		});
	}
}
