import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { validateOrReject } from "class-validator";
import { ExtractJwt, Strategy } from "passport-jwt";

import { UsersService } from "@resources/users/users.service";

import {
	AccessTokenPayload,
	AccessTokenPayloadEntity,
} from "../sessions/entities/access-token-payload.entity";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
	Strategy,
	"access-token"
) {
	constructor(
		protected readonly configService: ConfigService,
		private readonly usersService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>(
				"JWT_ACCESS_TOKEN_SECRET"
			),
		});
	}

	async validate(accessTokenPayload: AccessTokenPayload) {
		const accessTokenPayloadEntity =
			AccessTokenPayloadEntity.fromPlain(accessTokenPayload);

		// TODO: Move the error handling to a global exception filter
		await validateOrReject(accessTokenPayloadEntity).catch(() => {
			console.error("Invalid access token payload", accessTokenPayload);

			throw new UnauthorizedException("Invalid access token payload");
		});

		return this.usersService.findOne(accessTokenPayloadEntity.userId);
	}
}
