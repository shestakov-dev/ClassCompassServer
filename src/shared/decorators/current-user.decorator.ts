import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { RequestWithUser } from "@shared/types/request-with-user";

function getCurrentUserByContext(context: ExecutionContext) {
	const request = context.switchToHttp().getRequest<RequestWithUser>();

	return request.user;
}

export const CurrentUser = createParamDecorator(
	(_, context: ExecutionContext) => getCurrentUserByContext(context)
);
