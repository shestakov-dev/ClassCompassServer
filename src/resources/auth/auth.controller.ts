import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { Session, User } from "@prisma/client";

import { CurrentUser } from "@resources/access-tokens/current-user.decorator";
import { CurrentSession } from "@resources/refresh-tokens/current-session.decorator";
import { TokensEntity } from "@resources/sessions/entities/tokens.entity";

import { ApiPost, Auth } from "@decorators";

import { LoginDto } from "./dto/login.dto";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Logs a user in
	 */
	@HttpCode(HttpStatus.OK)
	@Post("login")
	@ApiPost({
		type: TokensEntity,
		successResponse: HttpStatus.OK,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@ApiBody({
		type: LoginDto,
	})
	@Auth("Unprotected")
	@UseGuards(LocalAuthGuard)
	login(@CurrentUser() currentUser: User) {
		return this.authService.login(currentUser);
	}

	/**
	 * Refreshes a user's access token
	 */
	@HttpCode(HttpStatus.OK)
	@Post("refresh")
	@ApiPost({
		type: TokensEntity,
		successResponse: HttpStatus.OK,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@Auth("Refresh token")
	refresh(@CurrentSession() currentSession: Session) {
		return this.authService.refresh(currentSession);
	}

	/**
	 * Logs a user out
	 */
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post("logout")
	@ApiPost({
		type: undefined,
		successResponse: HttpStatus.NO_CONTENT,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@Auth("Refresh token")
	logout(@CurrentSession() currentSession: Session) {
		this.authService.logout(currentSession);
	}
}
