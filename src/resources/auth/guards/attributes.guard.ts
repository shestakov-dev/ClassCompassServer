import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RequestWithUser } from "@resources/access-tokens/request-with-user";
import { UsersService } from "@resources/users/users.service";

import { Attribute, AttributeCondition } from "@shared/types/attributes";

import {
	ACCESS_TOKEN_KEY,
	ATTRIBUTES_KEY,
	attributesToString,
	AUTH_TYPE_KEY,
	AuthType,
} from "@decorators";

@Injectable()
export class AttributesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly usersService: UsersService
	) {}

	async canActivate(context: ExecutionContext) {
		const authType = this.reflector.get<AuthType>(
			AUTH_TYPE_KEY,
			context.getHandler()
		);

		if (authType !== ACCESS_TOKEN_KEY) {
			return true;
		}

		const requiredAttributes = this.reflector.getAllAndOverride<
			AttributeCondition[]
		>(ATTRIBUTES_KEY, [context.getHandler(), context.getClass()]);

		if (!requiredAttributes) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<RequestWithUser>();

		if (!user) {
			console.error("User not found in request.");

			throw new InternalServerErrorException(
				"User not found in request."
			);
		}

		const attributes = await this.usersService.getAttributes(user.id);

		const isAuthorized = requiredAttributes.every(attribute =>
			this.checkConditions(attribute, attributes)
		);

		if (!isAuthorized) {
			throw new ForbiddenException(
				`Missing required attributes: ${attributesToString(requiredAttributes)}.`
			);
		}

		return true;
	}

	private checkConditions(
		condition: AttributeCondition,
		userAttributes: Attribute[]
	): boolean {
		if (typeof condition === "string") {
			return userAttributes.includes(condition);
		}

		if ("AND" in condition) {
			return condition.AND.every(currentCondition =>
				this.checkConditions(currentCondition, userAttributes)
			);
		}

		if ("OR" in condition) {
			return condition.OR.some(currentCondition =>
				this.checkConditions(currentCondition, userAttributes)
			);
		}

		return false;
	}
}
