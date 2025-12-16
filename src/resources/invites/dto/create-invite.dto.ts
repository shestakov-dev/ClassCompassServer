import { ApiSchema } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsUUID, Min } from "class-validator";

@ApiSchema({
	description: "The data required to create a new invite",
})
export class CreateInviteDto {
	/**
	 * The user identifier for whom the invite is being created
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	userId: string;

	/**
	 * The time-to-live for the invite in seconds
	 * @example 3600
	 */
	@IsOptional()
	@IsNumber()
	@Min(1)
	ttlSeconds?: number;
}
