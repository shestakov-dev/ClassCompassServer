import {
	applyDecorators,
	ForbiddenException,
	SetMetadata,
	UnauthorizedException,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AttributeCondition } from "@shared/types/attributes";

export const ACCESS_TOKEN_KEY = "Access token";
export const REFRESH_TOKEN_KEY = "Refresh token";
export const UNPROTECTED_KEY = "Unprotected";

export const AUTH_TYPE_KEY = "authType";
export const ATTRIBUTES_KEY = "attributes";

export type AuthType =
	| typeof ACCESS_TOKEN_KEY
	| typeof REFRESH_TOKEN_KEY
	| typeof UNPROTECTED_KEY;

function conditionToStr(condition: AttributeCondition): string {
	if (typeof condition === "string") {
		return condition;
	}
	if ("AND" in condition) {
		return "(" + condition.AND.map(conditionToStr).join(" AND ") + ")";
	}
	if ("OR" in condition) {
		return "(" + condition.OR.map(conditionToStr).join(" OR ") + ")";
	}
	return "";
}

export function attributesToString(attributes: AttributeCondition[]): string {
	if (attributes.length === 0) {
		console.log("Attributes cannot be empty");

		throw new Error("Attributes cannot be empty");
	}

	return (
		attributes
			.map(conditionToStr)
			.join(", ")
			// Remove leading and trailing parentheses
			.replace(/^\(|\)$/g, "")
	);
}

export function Auth(type: AuthType, ...attributes: AttributeCondition[]) {
	const decorators: (ClassDecorator & MethodDecorator)[] = [];

	decorators.push(SetMetadata(AUTH_TYPE_KEY, type));

	if (type === UNPROTECTED_KEY) {
		return applyDecorators(...decorators);
	}

	if (attributes) {
		decorators.push(SetMetadata(ATTRIBUTES_KEY, attributes));

		if (attributes.length > 0) {
			decorators.push(
				ApiForbiddenResponse({
					description: `Missing required attributes: ${attributesToString(attributes)}.`,
					example: new ForbiddenException("Message").getResponse(),
				})
			);
		}
	}

	decorators.push(ApiBearerAuth(type));

	decorators.push(
		ApiUnauthorizedResponse({
			description: `${type} is missing or invalid.`,
			example: new UnauthorizedException("Message").getResponse(),
		})
	);

	return applyDecorators(...decorators);
}
