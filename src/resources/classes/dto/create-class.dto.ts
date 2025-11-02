import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new class",
})
export class CreateClassDto {
	/**
	 * The class's name
	 * @example "Class A"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The class's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	schoolId: string;
}
