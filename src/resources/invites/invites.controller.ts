import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { CreateInviteDto } from "./dto/create-invite.dto";

import { InvitesService } from "./invites.service";

@Controller("invites")
export class InvitesController {
	constructor(private readonly invitesService: InvitesService) {}

	@Post()
	async createInvite(
		@Body() createInviteDto: CreateInviteDto
	): Promise<void> {
		await this.invitesService.createInvite(createInviteDto);
	}

	@Get(":inviteCode")
	async useInvite(
		@Res() res: Response,
		@Param("inviteCode") inviteCode: string
	) {
		const redirectUrl = await this.invitesService.useInvite(inviteCode);

		return res.redirect(redirectUrl);
	}

	@Get("done/:inviteCode")
	async inviteDone(
		@Res() res: Response,
		@Param("inviteCode") inviteCode: string
	) {
		const redirectUrl = await this.invitesService.inviteDone(inviteCode);

		return res.redirect(redirectUrl);
	}
}
