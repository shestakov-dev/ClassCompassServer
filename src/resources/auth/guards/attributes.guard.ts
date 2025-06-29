import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RequestWithUser } from "@resources/access-tokens/request-with-user";
import { UsersService } from "@resources/users/users.service";

import { AttributeCondition, ATTRIBUTES_KEY } from "@decorators";

import { Attribute } from "../types/attributes";

@Injectable()
export class AttributesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly usersService: UsersService
	) {}

	async canActivate(context: ExecutionContext) {
		const requiredAttributes = this.reflector.getAllAndOverride<
			AttributeCondition[]
		>(ATTRIBUTES_KEY, [context.getHandler(), context.getClass()]);

		if (!requiredAttributes) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<RequestWithUser>();

		if (!user) {
			return false;
		}

		const attributes = await this.usersService.getAttributes(user.id);

		return requiredAttributes.every(attribute =>
			this.checkConditions(attribute, attributes)
		);
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
