import {
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

import {
	AUTH_TYPE_KEY,
	AuthType,
	REFRESH_TOKEN_KEY,
} from "@shared/decorators/auth.decorator";

@Injectable()
export class RefreshTokenGuard extends AuthGuard("refresh-token") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	handleRequest(err: any, user: any, info: Error | undefined) {
		if (err) {
			throw err;
		}

		if (!user) {
			throw new UnauthorizedException(
				info?.message ?? "Invalid refresh token"
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

		if (authType !== REFRESH_TOKEN_KEY) {
			return true;
		}

		return super.canActivate(context);
	}
}
