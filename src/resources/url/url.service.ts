import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UrlService {
	constructor(private readonly configService: ConfigService) {}

	private buildAppUrl(path: string): URL {
		const baseUrl = this.configService.getOrThrow<string>("APP_PUBLIC_URL");

		return new URL(path, baseUrl);
	}

	getInviteUrl(inviteCode: string): URL {
		const url = this.buildAppUrl(`/auth/invite/${inviteCode}`);

		return url;
	}

	getInviteDoneUrl(inviteCode: string): URL {
		const url = this.buildAppUrl(`/auth/invite/done/${inviteCode}`);

		return url;
	}

	getLoginUrl(): URL {
		return this.buildAppUrl("/auth/login");
	}

	getHydraCallbackUrl(): URL {
		const redirectPath = this.configService.getOrThrow<string>(
			"APP_AUTH_CALLBACK_ROUTE"
		);

		return this.buildAppUrl(redirectPath);
	}

	getHydraCodeExchangeUrl(endpoint: string): URL {
		const url = this.buildAppUrl(endpoint);

		return url;
	}

	getKratosLoginUrl(loginChallenge: string): URL {
		const baseUrl =
			this.configService.getOrThrow<string>("KRATOS_PUBLIC_URL");

		const continueRoute = this.configService.getOrThrow<string>(
			"APP_AUTH_CONTINUE_ROUTE"
		);

		const continueUrl = this.buildAppUrl(continueRoute);

		continueUrl.searchParams.set("login_challenge", loginChallenge);

		const url = new URL("/self-service/login/browser", baseUrl);

		url.searchParams.set("return_to", continueUrl.toString());

		return url;
	}

	getLogoutReturnUrl(): URL {
		return this.buildAppUrl(
			this.configService.getOrThrow<string>(
				"APP_AUTH_LOGOUT_RETURN_ROUTE"
			)
		);
	}
}
