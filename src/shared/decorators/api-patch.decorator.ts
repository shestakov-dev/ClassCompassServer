import { applyDecorators, HttpStatus } from "@nestjs/common";

import { ApiResponses, ApiResponsesOptions } from "@decorators";

export function ApiPatch({
	type,
	successResponse,
	errorResponses,
}: ApiResponsesOptions) {
	const ApiResponsesDecorator = ApiResponses({
		type,
		successResponse: successResponse ?? HttpStatus.OK,
		errorResponses: errorResponses ?? [
			HttpStatus.BAD_REQUEST,
			HttpStatus.NOT_FOUND,
			HttpStatus.CONFLICT,
		],
	});

	return applyDecorators(ApiResponsesDecorator);
}
