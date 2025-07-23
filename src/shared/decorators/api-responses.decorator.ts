import {
	applyDecorators,
	BadRequestException,
	HttpStatus,
} from "@nestjs/common";
import {
	ApiResponse,
	ApiResponseMetadata,
	ApiResponseOptions,
} from "@nestjs/swagger";

const CUSTOM_ERROR_RESPONSES: Partial<Record<HttpStatus, ApiResponseOptions>> =
	{
		[HttpStatus.BAD_REQUEST]: {
			status: HttpStatus.BAD_REQUEST,
			description: "Invalid data was provided.",
			example: new BadRequestException("Message").getResponse(),
		},
		[HttpStatus.NOT_FOUND]: {
			status: HttpStatus.NOT_FOUND,
			description: "A resource was not found.",
			example: new BadRequestException("Message").getResponse(),
		},
		[HttpStatus.CONFLICT]: {
			status: HttpStatus.CONFLICT,
			description: "A unique constraint violation occurred.",
			example: new BadRequestException("Message").getResponse(),
		},
	} as const;

export class ApiResponsesOptions {
	type: ApiResponseMetadata["type"];
	successResponse?: HttpStatus;
	errorResponses?: (ApiResponseOptions | HttpStatus)[];
}

export function ApiResponses({
	type,
	successResponse = HttpStatus.OK,
	errorResponses = [],
}: ApiResponsesOptions) {
	const successResponseDecorator = ApiResponse({
		type,
		status: successResponse,
	});

	const errorResponseDecorators = errorResponses.map(errorResponse => {
		if (typeof errorResponse === "number") {
			if (!(errorResponse in HttpStatus)) {
				throw new Error(
					`Unsupported error type: ${errorResponse}. Please provide a valid HttpStatus.`
				);
			}

			const options = CUSTOM_ERROR_RESPONSES[errorResponse];

			if (!options) {
				throw new Error(
					`No custom error response defined for status code ${errorResponse}. Please provide a valid ApiResponseOptions.`
				);
			}

			return ApiResponse(options);
		} else {
			return ApiResponse(errorResponse);
		}
	});

	return applyDecorators(
		successResponseDecorator,
		...errorResponseDecorators
	);
}
