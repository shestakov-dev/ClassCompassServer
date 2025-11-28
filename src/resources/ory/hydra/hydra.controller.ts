import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";

import { UrlService } from "@resources/url/url.service";

@Controller("auth/hydra")
export class HydraController {
	constructor(private readonly urlService: UrlService) {}

	// when we aren't logged in, hydra will redirect here with a login_challenge
	@Get("login")
	async login(
		@Query("login_challenge") challenge: string,
		@Res() res: Response
	) {
		if (!challenge) {
			return res.status(400).send("Missing login_challenge");
		}

		// Redirect to Kratos login, preserve challenge as query param
		const kratosLoginUrl = this.urlService.getKratosLoginUrl(challenge);

		return res.redirect(kratosLoginUrl.toString());
	}
}
