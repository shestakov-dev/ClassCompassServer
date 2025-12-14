import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { OATHKEEPER_GUEST_SUBJECT } from "@resources/auth/strategies/oathkeeper.strategy";

import { RequestWithUser } from "@shared/types/request-with-user";

function getCurrentIdentityIdByContext(context: ExecutionContext) {
	const request = context.switchToHttp().getRequest<RequestWithUser>();

	if (request.user?.identityId === OATHKEEPER_GUEST_SUBJECT) {
		return null;
	}

	return request.user?.identityId;
}

export const IdentityId = createParamDecorator((_, context: ExecutionContext) =>
	getCurrentIdentityIdByContext(context)
);
