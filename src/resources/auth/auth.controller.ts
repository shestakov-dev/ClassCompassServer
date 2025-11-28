import {
	Controller,
	Get,
	Headers,
	Query,
	Req,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("login")
	async login(@Res() res: Response) {
		const authorizationUrl = await this.authService.getAuthorizationUrl();

		return res.redirect(authorizationUrl.toString());
	}

	// get the code and state from hydra and we exchange it for tokens
	// this is the final step in the OIDC flow
	@Get("callback")
	async callback(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Query("state") state: string
	) {
		const endpoint = req.originalUrl;

		const tokens = await this.authService.handleCallback(endpoint, state);
		const claims = tokens.claims();

		res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.access_token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: tokens.expires_in! * 1000,
		});

		res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refresh_token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		});

		return { tokens, claims };
	}

	@Get("refresh")
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshToken = req.cookies.refresh_token;

		if (!refreshToken) {
			throw new UnauthorizedException("No refresh token");
		}

		const tokens = await this.authService.refresh(refreshToken);

		res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.access_token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: tokens.expires_in! * 1000,
		});

		if (tokens.refresh_token) {
			res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refresh_token, {
				httpOnly: true,
				secure: true,
				sameSite: "lax",
			});
		}

		return { tokens };
	}

	@Get("logout")
	async logout(
		@Res({ passthrough: true }) res: Response,
		@Headers("cookie") cookie: string
	) {
		res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		});

		res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		});

		const logoutUrl = await this.authService.logout(cookie);

		return res.redirect(logoutUrl);
	}
}
