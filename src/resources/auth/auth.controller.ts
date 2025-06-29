import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { Session, User } from "@prisma/client";

import { CurrentUser } from "@resources/access-tokens/current-user.decorator";
import { CurrentSession } from "@resources/refresh-tokens/current-session.decorator";
import { TokensEntity } from "@resources/sessions/entities/tokens.entity";

import { ApiPost, Unprotected } from "@decorators";

import { LoginDto } from "./dto/login.dto";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Logs a user in
	 */
	@Unprotected()
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
	@UseGuards(LocalAuthGuard)
	login(@CurrentUser() currentUser: User) {
		return this.authService.login(currentUser);
	}

	/**
	 * Refreshes a user's access token
	 */
	@Unprotected()
	@HttpCode(HttpStatus.OK)
	@Post("refresh")
	@ApiPost({
		type: TokensEntity,
		successResponse: HttpStatus.OK,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@ApiBearerAuth("Refresh Token")
	@UseGuards(RefreshTokenGuard)
	refresh(@CurrentSession() currentSession: Session) {
		return this.authService.refresh(currentSession);
	}

	/**
	 * Logs a user out
	 */
	@Unprotected()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post("logout")
	@ApiPost({
		type: undefined,
		successResponse: HttpStatus.NO_CONTENT,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@ApiBearerAuth("Refresh Token")
	@UseGuards(RefreshTokenGuard)
	logout(@CurrentSession() currentSession: Session) {
		this.authService.logout(currentSession);
	}
}
