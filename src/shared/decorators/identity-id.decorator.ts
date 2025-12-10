import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { OATHKEEPER_GUEST_SUBJECT } from "@resources/auth/strategies/oathkeeper.strategy";

import { RequestWithIdentityId } from "@shared/types/request-with-identity-id";

function getCurrentIdentityIdByContext(context: ExecutionContext) {
	const request = context.switchToHttp().getRequest<RequestWithIdentityId>();

	if (request.identityId === OATHKEEPER_GUEST_SUBJECT) {
		return null;
	}

	return request.identityId;
}

export const IdentityId = createParamDecorator((_, context: ExecutionContext) =>
	getCurrentIdentityIdByContext(context)
);
