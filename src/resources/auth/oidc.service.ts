import {
	Injectable,
	OnModuleInit,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import * as client from "openid-client";

import { UrlService } from "@resources/url/url.service";

interface OidcStateData {
	codeVerifier: string;
	nonce: string;
}

@Injectable()
export class OidcService implements OnModuleInit {
	private readonly ttlSeconds: number = 5 * 60; // 5 minutes

	private config: client.Configuration;

	constructor(
		private readonly configService: ConfigService,
		private readonly urlService: UrlService,
		@InjectRedis() private readonly redis: Redis
	) {}

	async onModuleInit() {
		this.config = await client.discovery(
			new URL(this.configService.getOrThrow<string>("HYDRA_PUBLIC_URL")),
			this.configService.getOrThrow<string>("HYDRA_CLIENT_ID"),
			{},
			client.ClientSecretBasic(
				this.configService.getOrThrow<string>("HYDRA_CLIENT_SECRET")
			)
		);
	}

	async buildAuthorizationUrl(): Promise<URL> {
		const codeVerifier = client.randomPKCECodeVerifier();
		const codeChallenge =
			await client.calculatePKCECodeChallenge(codeVerifier);

		const state = client.randomState();

		const nonce = client.randomNonce();

		await this.writeOidcStateData(state, {
			codeVerifier,
			nonce,
		});

		const url = client.buildAuthorizationUrl(this.config, {
			redirect_uri: this.urlService.getHydraCallbackUrl().toString(),
			scope: this.configService.getOrThrow<string>("HYDRA_CLIENT_SCOPE"),
			state,
			code_challenge: codeChallenge,
			code_challenge_method: "S256",
			nonce,
		});

		return url;
	}

	async authorizationCodeGrant(currentUrl: URL, state: string) {
		const oidcStateData = await this.readOidcStateData(state);

		if (!oidcStateData) {
			throw new UnauthorizedException("Invalid or expired OIDC state");
		}

		return client.authorizationCodeGrant(this.config, currentUrl, {
			pkceCodeVerifier: oidcStateData.codeVerifier,
			expectedNonce: oidcStateData.nonce,
			expectedState: state,
			idTokenExpected: true,
		});
	}

	async refreshTokenGrant(refreshToken: string) {
		return client.refreshTokenGrant(this.config, refreshToken);
	}

	private getRedisKey(state: string): string {
		return `oidc:${state}`;
	}

	private isOidcStateData(data: any): data is OidcStateData {
		return (
			typeof data === "object" &&
			data !== null &&
			typeof data.codeVerifier === "string" &&
			typeof data.nonce === "string"
		);
	}

	private async writeOidcStateData(state: string, data: OidcStateData) {
		const redisKey = this.getRedisKey(state);

		await this.redis.set(
			redisKey,
			JSON.stringify(data),
			"EX",
			this.ttlSeconds
		);
	}

	private async readOidcStateData(state: string) {
		const redisKey = this.getRedisKey(state);

		const data = await this.redis.get(redisKey);

		if (!data) {
			return null;
		}

		const parsedData = JSON.parse(data);

		if (!this.isOidcStateData(parsedData)) {
			return null;
		}

		await this.redis.del(redisKey);

		return parsedData;
	}
}
