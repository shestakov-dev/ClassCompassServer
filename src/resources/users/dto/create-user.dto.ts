import { ApiSchema } from "@nestjs/swagger";
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsStrongPassword,
	IsUUID,
	MaxLength,
} from "class-validator";

@ApiSchema({
	description: "The data required to create a new user",
})
export class CreateUserDto {
	/**
	 * The user's name
	 * @example "John Doe"
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * The user's email
	 * @example "johndoe@example.com"
	 */
	@IsEmail()
	email: string;

	/**
	 * The user's unhashed password
	 * @example "password"
	 */
	@IsStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	// TODO: Test this with a password that is too long and check if hashes might match (only the first 72 bytes are hashed)
	@MaxLength(64)
	password: string;

	/**
	 * The user's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	@IsUUID()
	schoolId: string;

	/**
	 * The user's role identifiers
	 * @example ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
	 */
	@IsOptional()
	@IsUUID(4, { each: true })
	roleIds?: string[];
}
