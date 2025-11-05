import { ApiSchema } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new teacher",
})
export class CreateTeacherDto {
	/**
	 * The teacher's user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	userId: string;

	/**
	 * The teacher's subject identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440000"]
	 */
	@IsOptional()
	@IsUUID(4, { each: true })
	subjectIds?: string[];
}
