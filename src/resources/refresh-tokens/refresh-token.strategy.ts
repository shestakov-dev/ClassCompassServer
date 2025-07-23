import {
	forwardRef,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import * as argon2 from "argon2";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { ExtractJwt, Strategy } from "passport-jwt";

import { RequestWithSession } from "@resources/refresh-tokens/request-with-session";
import {
	RefreshTokenPayload,
	RefreshTokenPayloadEntity,
} from "@resources/sessions/entities/refresh-token-payload.entity";

import { SessionsService } from "../sessions/sessions.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	"refresh-token"
) {
	constructor(
		private readonly configService: ConfigService,
		@Inject(forwardRef(() => SessionsService))
		private readonly sessionsService: SessionsService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>(
				"JWT_REFRESH_TOKEN_SECRET"
			),
			passReqToCallback: true,
		});
	}

	async validate(
		req: RequestWithSession,
		refreshTokenPayload: RefreshTokenPayload
	) {
		const refreshTokenPayloadEnity = plainToInstance(
			RefreshTokenPayloadEntity,
			refreshTokenPayload
		);

		// TODO: Move the error handling to a global exception filter
		await validateOrReject(refreshTokenPayloadEnity).catch(() => {
			console.error("Invalid refresh token payload", refreshTokenPayload);

			throw new UnauthorizedException("Invalid refresh token payload");
		});

		const session = await this.sessionsService.findOne(
			refreshTokenPayloadEnity.sessionId
		);

		const refreshToken = req.headers.authorization?.split(" ")[1];

		if (!refreshToken) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		// compare the hashed refresh token with the current one
		// if they don't match, it was likely stolen
		const valid = await argon2.verify(session.refreshToken, refreshToken);

		// TODO: Flag this request as a potential security risk
		if (!valid) {
			// revoke all sessions for the user to remediate the security risk
			// TODO: Take better security measures (ie. notify the user, etc.)
			await this.sessionsService.revokeAllForUser(session.userId);

			console.log("Revoked all sessions for user", session.userId);

			throw new UnauthorizedException("Invalid refresh token");
		}

		req.session = session;

		// return a truthy value to indicate that the refresh token is valid
		// this will set req.user to the returned value though
		return true;
	}
}
