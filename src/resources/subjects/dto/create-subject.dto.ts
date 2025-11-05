import { ApiSchema } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new subject",
})
export class CreateSubjectDto {
	/**
	 * The subject's name
	 * @example "Mathematics"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The subject's associated school
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	schoolId: string;

	/**
	 * The subject's teacher identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440000"]
	 */
	@IsOptional()
	@IsUUID(4, { each: true })
	teacherIds?: string[];
}
