import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new building",
})
export class CreateBuildingDto {
	/**
	 * The building's name
	 * @example "Main Building"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The building's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	@IsUUID()
	schoolId: string;
}
