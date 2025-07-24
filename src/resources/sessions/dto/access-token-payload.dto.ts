import { IsUUID } from "class-validator";

import { AccessTokenPayload } from "../entities/access-token-payload.entity";

export type AccessTokenPayloadInput = Pick<AccessTokenPayload, "userId">;

export class AccessTokenPayloadDto implements AccessTokenPayloadInput {
	/**
	 * The user's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	userId: string;
}
