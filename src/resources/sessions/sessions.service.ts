import { randomUUID } from "crypto";

import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Session } from "@prisma/client";
import * as argon2 from "argon2";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

import { PrismaService } from "@prisma/prisma.service";

import {
	AccessTokenPayloadDto,
	AccessTokenPayloadInput,
} from "./dto/access-token-payload.dto";
import {
	RefreshTokenPayloadDto,
	RefreshTokenPayloadInput,
} from "./dto/refresh-token-payload.dto";

import { RefreshTokenPayload } from "./entities/refresh-token-payload.entity";
import { TokensEntity } from "./entities/tokens.entity";

@Injectable()
export class SessionsService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject("JWT_ACCESS_TOKEN_SERVICE")
		private readonly jwtAccessTokenService: JwtService,
		@Inject("JWT_REFRESH_TOKEN_SERVICE")
		private readonly jwtRefreshTokenService: JwtService
	) {}

	async findOne(id: string) {
		return this.prisma.client.session.findUniqueOrThrow({
			where: { id },
		});
	}

	async authenticate(userId: string) {
		const sessionId = randomUUID();

		const accessToken = await this.issueAccessToken({
			userId,
		});

		const refreshToken = await this.issueRefreshToken({
			sessionId,
		});

		const decodedRefreshToken =
			this.jwtRefreshTokenService.decode<RefreshTokenPayload>(
				refreshToken
			);

		// store the hashed refresh token in the database to avoid security risks
		const hashedRefreshToken = await argon2.hash(refreshToken, {
			type: argon2.argon2id,
		});

		await this.prisma.client.session.create({
			data: {
				id: sessionId,
				userId,
				refreshToken: hashedRefreshToken,
				expiresAt: new Date(decodedRefreshToken.exp * 1000),
			},
		});

		return TokensEntity.fromPlain({
			accessToken,
			refreshToken,
		});
	}

	async refresh(session: Session) {
		const accessToken = await this.issueAccessToken({
			userId: session.userId,
		});

		const refreshToken = await this.issueRefreshToken({
			sessionId: session.id,
		});

		const decodedRefreshToken =
			this.jwtRefreshTokenService.decode<RefreshTokenPayload>(
				refreshToken
			);

		// update the session with the new refresh token
		const hashedRefreshToken = await argon2.hash(refreshToken, {
			type: argon2.argon2id,
		});

		await this.prisma.client.session.update({
			where: { id: session.id },
			data: {
				refreshToken: hashedRefreshToken,
				expiresAt: new Date(decodedRefreshToken.exp * 1000),
			},
		});

		return TokensEntity.fromPlain({
			accessToken,
			refreshToken,
		});
	}

	async revoke(sessionId: string) {
		await this.prisma.client.session.delete({
			where: { id: sessionId },
		});
	}

	async revokeAllForUser(userId: string) {
		await this.prisma.client.session.deleteMany({
			where: { userId },
		});
	}

	private async issueAccessToken(
		accessTokenPayloadInput: AccessTokenPayloadInput
	) {
		const accessTokenPayloadDto = plainToInstance(
			AccessTokenPayloadDto,
			accessTokenPayloadInput
		);

		// TODO: Move the error handling to a global exception filter
		await validateOrReject(accessTokenPayloadDto).catch(() => {
			console.error(
				"Invalid access token payload",
				accessTokenPayloadInput
			);

			throw new UnauthorizedException("Invalid access token payload");
		});

		// add the issued at time to the payload to make sure the token isn't replayed
		return this.jwtAccessTokenService.sign({
			...instanceToPlain(accessTokenPayloadDto),
			iat: Math.floor(Date.now() / 1000),
		});
	}

	private async issueRefreshToken(
		refreshTokenPayloadInput: RefreshTokenPayloadInput
	) {
		const refreshTokenPayloadDto = plainToInstance(
			RefreshTokenPayloadDto,
			refreshTokenPayloadInput
		);

		// TODO: Move the error handling to a global exception filter
		await validateOrReject(refreshTokenPayloadDto).catch(() => {
			console.error(
				"Invalid refresh token payload",
				refreshTokenPayloadInput
			);

			throw new UnauthorizedException("Invalid refresh token payload");
		});

		// add the issued at time to the payload to make sure the token isn't replayed
		return this.jwtRefreshTokenService.sign({
			...instanceToPlain(refreshTokenPayloadDto),
			iat: Math.floor(Date.now() / 1000),
		});
	}
}
