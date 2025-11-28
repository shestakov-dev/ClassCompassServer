import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration, OAuth2Api } from "@ory/hydra-client";

@Injectable()
export class HydraService {
	private readonly oAuth2Api: OAuth2Api;

	constructor(private readonly configService: ConfigService) {
		this.oAuth2Api = new OAuth2Api(
			new Configuration({
				basePath:
					this.configService.getOrThrow<string>("HYDRA_ADMIN_URL"),
			})
		);
	}

	async acceptLoginRequest(
		loginChallenge: string,
		subject: string
	): Promise<string> {
		const response = await this.oAuth2Api.acceptOAuth2LoginRequest({
			loginChallenge,
			acceptOAuth2LoginRequest: {
				subject,
			},
		});

		return response.data.redirect_to;
	}
}
