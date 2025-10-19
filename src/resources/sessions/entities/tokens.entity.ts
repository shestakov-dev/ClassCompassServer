import { ApiSchema } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A object containing the access and refresh tokens for a user",
})
export class TokensEntity {
	static fromPlain(plain: Partial<TokensEntity>): TokensEntity {
		return plainToInstance(TokensEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The jwt access token
	 */
	accessToken: string;

	/**
	 * The jwt refresh token
	 */
	refreshToken: string;
}
