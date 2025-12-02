import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

import { UsersService } from "@resources/users/users.service";

export const OATHKEEPER_GUEST_SUBJECT = "guest";

@Injectable()
export class OathkeeperStrategy extends PassportStrategy(
	Strategy,
	"oathkeeper"
) {
	constructor(
		configService: ConfigService,
		private readonly usersService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKeyProvider: passportJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: configService.getOrThrow<string>(
					"OATHKEEPER_JWKS_URI"
				),
			}),
			algorithms: ["RS256"],
			issuer: "https://api.classcompass.shestakov.app/",
			audience: "class-compass-backend",
		});
	}

	validate(payload: any) {
		if (!payload.sub) {
			throw new UnauthorizedException("Invalid token: missing subject");
		}

		if (payload.sub === OATHKEEPER_GUEST_SUBJECT) {
			return {
				id: OATHKEEPER_GUEST_SUBJECT,
			};
		}

		return this.usersService.findOneByIdentityId(payload.sub);
	}
}
