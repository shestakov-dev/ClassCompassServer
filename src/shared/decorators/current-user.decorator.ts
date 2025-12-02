import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { OATHKEEPER_GUEST_SUBJECT } from "@resources/auth/strategies/oathkeeper.strategy";

import { RequestWithUser } from "@shared/types/request-with-user";

function getCurrentUserByContext(context: ExecutionContext) {
	const request = context.switchToHttp().getRequest<RequestWithUser>();

	if (request.user?.id === OATHKEEPER_GUEST_SUBJECT) {
		return null;
	}

	return request.user;
}

export const CurrentUser = createParamDecorator(
	(_, context: ExecutionContext) => getCurrentUserByContext(context)
);
