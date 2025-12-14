import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import {
	KETO_PERMISSION_KEY,
	KetoPermissionOptions,
} from "@shared/decorators/keto-permission.decorator";
import { RequestWithUser } from "@shared/types/request-with-user";

import { KetoService } from "../keto/keto.service";

@Injectable()
export class KetoPermissionGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly ketoService: KetoService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const options = this.reflector.get<KetoPermissionOptions>(
			KETO_PERMISSION_KEY,
			context.getHandler()
		);

		// If no options are set, allow access
		if (!options) {
			return true;
		}

		const request = context.switchToHttp().getRequest<RequestWithUser>();

		const user = request.user;

		// This should never happen, as we should have an authentication guard before this
		if (!user || !user.identityId) {
			console.error(
				"KetoPermissionGuard: No user found in request context"
			);

			throw new UnauthorizedException("User not authenticated");
		}

		const objectId = this.extractObjectId(request, options);

		// This should never happen, as we should have validated the request before this
		if (!objectId || typeof objectId !== "string") {
			console.error(
				`KetoPermissionGuard: Unable to extract object ID using options ${JSON.stringify(
					options
				)}`
			);

			throw new InternalServerErrorException(
				"Unable to extract object ID for permission check"
			);
		}

		const isAuthorized = await this.ketoService.checkPermission({
			namespace: options.namespace,
			object: objectId,
			relation: options.relation,
			subjectId: user.identityId,
		});

		if (!isAuthorized) {
			throw new ForbiddenException(
				`User does not have permission to ${options.relation} this ${options.namespace}`
			);
		}

		return true;
	}

	private extractObjectId(
		request: RequestWithUser,
		options: KetoPermissionOptions
	) {
		switch (options.source) {
			case "body":
				return request.body[options.key];
			case "params":
				return request.params[options.key];
			case "query":
				return request.query[options.key];
			case "fixed":
				return options.value;
		}
	}
}
