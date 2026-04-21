import { ApiSchema } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new floor",
})
export class CreateFloorDto {
	/**
	 * The floor's number
	 * @example 3
	 */
	@IsNumber()
	number: number;

	/**
	 * The floor's description
	 * @example "Third floor of the main building"
	 */
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (value === "" ? null : value))
	description?: string | null;

	/**
	 * The floor's building identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	buildingId: string;
}
