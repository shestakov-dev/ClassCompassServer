import { Injectable } from "@nestjs/common";

import { KratosService } from "@resources/ory/kratos/kratos.service";
import { UrlService } from "@resources/url/url.service";

import { OidcService } from "./oidc.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly urlService: UrlService,
		private readonly oidcService: OidcService,
		private readonly kratosService: KratosService
	) {}

	getAuthorizationUrl() {
		return this.oidcService.buildAuthorizationUrl();
	}

	handleCallback(originalUrl: string, state: string) {
		const currentUrl = this.urlService.getHydraCodeExchangeUrl(originalUrl);

		return this.oidcService.authorizationCodeGrant(currentUrl, state);
	}

	refresh(refreshToken: string) {
		return this.oidcService.refreshTokenGrant(refreshToken);
	}

	logout(cookie: string) {
		const returnToUrl = this.urlService.getLogoutReturnUrl();

		return this.kratosService.createLogoutLink(
			cookie,
			returnToUrl.toString()
		);
	}
}
