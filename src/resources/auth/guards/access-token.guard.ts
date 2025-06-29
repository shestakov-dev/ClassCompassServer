import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

import { UNPROTECTED_KEY } from "@decorators";

@Injectable()
export class AccessTokenGuard
	extends AuthGuard("access-token")
	implements CanActivate
{
	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const isUnprotected = this.reflector.get<boolean>(
			UNPROTECTED_KEY,
			context.getHandler()
		);

		if (isUnprotected) {
			return true;
		}

		return super.canActivate(context);
	}
}
