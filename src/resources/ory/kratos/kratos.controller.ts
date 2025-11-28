import {
	Controller,
	Get,
	Headers,
	Query,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Response } from "express";

import { KratosService } from "./kratos.service";
import { HydraService } from "../hydra/hydra.service";

@ApiExcludeController()
@Controller("auth/kratos")
export class KratosController {
	constructor(
		private readonly kratosService: KratosService,
		private readonly hydraService: HydraService
	) {}

	// GET /continue with a login challenge. we get here after logging in via kratos (this is the return_to URL)
	// we should accept the hydra login request and redirect to the url provided by hydra (might be consent or the final redirect to the app)
	@Get("continue")
	async continue(
		@Res() res: Response,
		@Query("login_challenge") challenge: string,
		@Headers("cookie") cookie: string
	) {
		// Call Kratos whoami to get session identity
		const session = await this.kratosService.getSession(cookie);

		if (!session.identity) {
			throw new UnauthorizedException("User is not authenticated");
		}

		// Accept Hydra login request
		const redirectTo = await this.hydraService.acceptLoginRequest(
			challenge,
			session.identity.id
		);

		// Redirect to Hydra OIDC continuation
		return res.redirect(redirectTo);
	}
}
