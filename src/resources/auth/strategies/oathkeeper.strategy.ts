import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

import { KratosService } from "@resources/ory/kratos/kratos.service";

export const OATHKEEPER_GUEST_SUBJECT = "guest";
const SESSION_REFRESH_WINDOW_MS = 60 * 60 * 1000;

@Injectable()
export class OathkeeperStrategy extends PassportStrategy(
	Strategy,
	"oathkeeper"
) {
	constructor(
		configService: ConfigService,
		private readonly kratosService: KratosService
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

	async validate(payload: any) {
		console.log(payload);

		if (!payload.sub) {
			throw new UnauthorizedException("Invalid token: missing subject");
		}

		if (payload.sub === OATHKEEPER_GUEST_SUBJECT) {
			return {
				id: OATHKEEPER_GUEST_SUBJECT,
			};
		}

		const session = payload.session;

		if (!session || !session.id || !session.expires_at) {
			// If Oathkeeper didn't hydrate the session, we can't trust the expiration
			throw new UnauthorizedException(
				"Invalid token: missing session context"
			);
		}

		// Calculate when the session expires and whether we need to extend it
		const now = Date.now();
		const expiresAt = new Date(session.expires_at).getTime();
		const timeRemaining = expiresAt - now;

		if (timeRemaining > 0 && timeRemaining < SESSION_REFRESH_WINDOW_MS) {
			console.log("extending");

			// We attempt to extend the session but don't block the request if it fails
			try {
				await this.kratosService.extendSession(session.id);
			} catch (error) {
				console.error(error);
			}
		}

		return payload.sub;
	}
}
