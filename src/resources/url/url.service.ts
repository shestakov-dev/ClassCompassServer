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

	getDefaultRedirectUrl(): URL {
		const urlString = this.configService.getOrThrow<string>(
			"APP_DEFAULT_REDIRECT_URL"
		);

		return new URL(urlString);
	}
}
