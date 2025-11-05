import { ApiSchema } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new student",
})
export class CreateStudentDto {
	/**
	 * The student's user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	userId: string;

	/**
	 * The student's class identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	@IsUUID()
	classId: string;
}
