import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new room",
})
export class CreateRoomDto {
	/**
	 * The room's name
	 * @example "Chemistry Lab 1"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The room's floor identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	floorId: string;
}
