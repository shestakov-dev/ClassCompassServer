import { applyDecorators, HttpStatus } from "@nestjs/common";

import { ApiResponses, ApiResponsesOptions } from "@decorators";

export function ApiGet({
	type,
	successResponse,
	errorResponses,
}: ApiResponsesOptions) {
	return applyDecorators(
		ApiResponses({
			type,
			successResponse: successResponse ?? HttpStatus.OK,
			errorResponses: errorResponses ?? [
				HttpStatus.BAD_REQUEST,
				HttpStatus.NOT_FOUND,
			],
		})
	);
}
