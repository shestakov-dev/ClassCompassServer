import { applyDecorators, HttpStatus } from "@nestjs/common";

import { ApiResponses, ApiResponsesOptions } from "@decorators";

export function ApiPost({
	type,
	successResponse,
	errorResponses,
}: ApiResponsesOptions) {
	return applyDecorators(
		ApiResponses({
			type,
			successResponse: successResponse ?? HttpStatus.CREATED,
			errorResponses: errorResponses ?? [
				HttpStatus.BAD_REQUEST,
				HttpStatus.NOT_FOUND,
				HttpStatus.CONFLICT,
			],
		})
	);
}
