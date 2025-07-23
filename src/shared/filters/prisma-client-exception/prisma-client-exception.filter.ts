import {
	ArgumentsHost,
	// BadRequestException,
	Catch,
	ConflictException,
	ExceptionFilter,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";

// TODO: Make sure this filter works everywhere in the application as expected.
@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
	catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();

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
