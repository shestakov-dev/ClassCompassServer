import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

@ApiSchema({
	description: "The data required to create a new school",
})
export class CreateSchoolDto {
	/**
	 * The school's name
	 * @example "School A"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;
}
