import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

import {
	ACCESS_TOKEN_KEY,
	AUTH_TYPE_KEY,
	AuthType,
} from "@shared/decorators/auth.decorator";

@Injectable()
export class AccessTokenGuard
	extends AuthGuard("access-token")
	implements CanActivate
{
	constructor(private readonly reflector: Reflector) {
		super();
	}

	handleRequest(err: any, user: any, info: Error | undefined) {
		if (err) {
			throw err;
		}

		if (!user) {
			throw new UnauthorizedException(
				info?.message ?? "Invalid access token"
			);
		}

		return user;
	}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const authType = this.reflector.get<AuthType>(
			AUTH_TYPE_KEY,
			context.getHandler()
		);

		if (authType !== ACCESS_TOKEN_KEY) {
			return true;
		}

		return super.canActivate(context);
	}
}
