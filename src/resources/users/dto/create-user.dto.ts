import { ApiSchema } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

@ApiSchema({
	description: "The data required to create a new user",
})
export class CreateUserDto {
	/**
	 * The user's first name
	 * @example "John"
	 */
	@IsString()
	@IsNotEmpty()
	firstName: string;

	/**
	 * The user's last name
	 * @example "Doe"
	 */
	@IsString()
	@IsNotEmpty()
	lastName: string;

	/**
	 * The user's email
	 * @example "johndoe@example.com"
	 */
	@IsEmail()
	email: string;

	/**
	 * The user's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	schoolId: string;
}
