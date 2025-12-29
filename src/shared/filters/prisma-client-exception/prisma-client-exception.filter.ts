import {
	ArgumentsHost,
	// BadRequestException,
	Catch,
	ConflictException,
	ExceptionFilter,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import {
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import { Response } from "express";

// TODO: Make sure this filter works everywhere in the application as expected.
@Catch(PrismaClientKnownRequestError, PrismaClientUnknownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
	catch(
		exception:
			| PrismaClientKnownRequestError
			| PrismaClientUnknownRequestError,
		host: ArgumentsHost
	) {
		const response = host.switchToHttp().getResponse<Response>();

		// Handle unknown errors (raw database errors like foreign key violations)
		if (exception instanceof PrismaClientUnknownRequestError) {
			const message = exception.message;

			// Check for foreign key constraint violations
			if (
				message.includes("violates") &&
				message.includes("foreign key")
			) {
				let customMessage =
					"Cannot delete this record because it has related records.";

				// Extract the referencing table from the error message
				const detailMatch = message.match(
					/is referenced from table "(\w+)"/
				);

				const tableMatch = message.match(/on table "(\w+)"/);

				if (tableMatch && detailMatch) {
					const deletedTable = tableMatch[1]; // e.g., "Teacher"
					const referencingTable = detailMatch[1]; // e.g., "Lesson"

					customMessage = `Cannot delete this ${deletedTable} because it has related ${referencingTable} records.`;
				}

				const responseException = new ConflictException(customMessage);

				return response
					.status(responseException.getStatus())
					.json(responseException.getResponse());
			}

			// For other unknown errors
			console.error("Unknown Prisma error:", exception);

			const responseException = new InternalServerErrorException(
				"An unexpected database error occurred."
			);

			return response
				.status(responseException.getStatus())
				.json(responseException.getResponse());
		}

		// Handle known Prisma errors
		const modelName = exception.meta?.modelName;

		switch (exception.code) {
			case "P2002": {
				// TODO: Make these error messages more user-friendly.
				const targetField = exception.meta?.target as string;
				// .split(
				// 	"_"
				// )[1];

				const customMessage = `${modelName}: A unique constraint violation occurred. The field "${targetField}" must be unique.`;

				const responseException = new ConflictException(customMessage);

				return response
					.status(responseException.getStatus())
					.json(responseException.getResponse());
			}

			case "P2003": {
				// Foreign key constraint failed
				const field = exception.meta?.field_name as string;

				const customMessage = `${modelName}: Cannot delete this record because it has related records referencing "${field}".`;

				const responseException = new ConflictException(customMessage);

				return response
					.status(responseException.getStatus())
					.json(responseException.getResponse());
			}

			// case "P2023": {
			// 	const message = exception.meta?.message;

			// 	const customMessage = `${modelName}: ${message}`;

			// 	const responseException = new BadRequestException(
			// 		customMessage
			// 	);

			// 	return response
			// 		.status(responseException.getStatus())
			// 		.json(responseException.getResponse());
			// }

			case "P2025": {
				const cause = exception.meta?.cause;

				const customMessage = `${modelName}: ${cause}`;

				const responseException = new NotFoundException(customMessage);

				return response
					.status(responseException.getStatus())
					.json(responseException.getResponse());
			}

			default: {
				console.error(exception);

				const responseException = new InternalServerErrorException(
					"An unexpected error occurred."
				);

				return response
					.status(responseException.getStatus())
					.json(responseException.getResponse());
			}
		}
	}
}
