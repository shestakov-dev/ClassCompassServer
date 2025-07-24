import { IsNumber, IsUUID } from "class-validator";

export type AccessTokenPayload = {
	userId: string;
	iat: number;
	exp: number;
};

export class AccessTokenPayloadEntity implements AccessTokenPayload {
	/**
	 * The user's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	userId: string;

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
