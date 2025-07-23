import { applyDecorators, HttpStatus } from "@nestjs/common";

import { ApiResponses, ApiResponsesOptions } from "@decorators";

export function ApiDelete({
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
		],
	});

	return applyDecorators(ApiResponsesDecorator);
}
