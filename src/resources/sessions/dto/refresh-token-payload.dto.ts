import { IsUUID } from "class-validator";

import { RefreshTokenPayload } from "../entities/refresh-token-payload.entity";

export type RefreshTokenPayloadInput = Pick<RefreshTokenPayload, "sessionId">;

export class RefreshTokenPayloadDto implements RefreshTokenPayloadInput {
	/**
	 * The session's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	sessionId: string;
}
