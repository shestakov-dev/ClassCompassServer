import { IsNumber, IsUUID } from "class-validator";

export type RefreshTokenPayload = {
	sessionId: string;
	iat: number;
	exp: number;
};

export class RefreshTokenPayloadEntity implements RefreshTokenPayload {
	/**
	 * The session's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	sessionId: string;

	/**
	 * The time at which the token was issued
	 * (in seconds since the Unix epoch)
	 * @example 1740993313
	 */
	@IsNumber()
	iat: number;

	/**
	 * The time at which the token will expire
	 * (in seconds since the Unix epoch)
	 * @example 1741598113
	 */
	@IsNumber()
	exp: number;
}
