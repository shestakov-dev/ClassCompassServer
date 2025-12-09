import {
	Injectable,
	NotFoundException,
	OnApplicationBootstrap,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { InvitesService } from "@resources/invites/invites.service";
import { KetoService } from "@resources/ory/keto/keto.service";
import { KratosService } from "@resources/ory/kratos/kratos.service";

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
	constructor(
		private readonly configService: ConfigService,
		private readonly kratosService: KratosService,
		private readonly ketoService: KetoService,
		private readonly invitesService: InvitesService
	) {}

	async onApplicationBootstrap() {
		await this.ensurePlatformAdmin();
	}

	private async ensurePlatformAdmin() {
		const adminEmail = this.configService.getOrThrow<string>(
			"PLATFORM_ADMIN_EMAIL"
		);
		const adminFirstName = this.configService.getOrThrow<string>(
			"PLATFORM_ADMIN_FIRST_NAME"
		);
		const adminLastName = this.configService.getOrThrow<string>(
			"PLATFORM_ADMIN_LAST_NAME"
		);

		try {
			await this.kratosService.getIdentityByEmail(adminEmail);

			return;
		} catch (error) {
			// If the error is not a NotFoundException, rethrow it
			if (!(error instanceof NotFoundException)) {
				throw error;
			}
		}

		// Identity does not exist, continue to create it
		const newIdentity = await this.kratosService.createIdentity({
			email: adminEmail,
			firstName: adminFirstName,
			lastName: adminLastName,
		});

		// Give the platform admin privileges in Keto
		await this.ketoService.createRelationship({
			namespace: "Platform",
			relation: "admins",
			object: "ClassCompass",
			subjectId: newIdentity.id,
		});

		// Create an invite for the new admin to set their credentials
		await this.invitesService.createInviteWithIdentityId(
			adminEmail,
			adminFirstName,
			adminLastName,
			newIdentity.id
		);

		console.warn(
			`Platform admin ${adminEmail} created. An invite has been sent to set up credentials.`
		);
	}
}
