import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Res,
} from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Response } from "express";

import { KetoNamespace } from "@resources/ory/keto/definitions";

import { KetoPermission } from "@shared/decorators/keto-permission.decorator";

import { ApiPost } from "@decorators";

import { CreateInviteDto } from "./dto/create-invite.dto";

import { InvitesService } from "./invites.service";

@Controller("invites")
export class InvitesController {
	constructor(private readonly invitesService: InvitesService) {}

	/**
	 * Create a new invite for a user to set up their account
	 */
	@Post()
	@ApiPost({
		type: undefined,
		errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
	})
	@KetoPermission<CreateInviteDto>({
		namespace: KetoNamespace.User,
		relation: "manage",
		source: "body",
		key: "userId",
	})
	async createInvite(
		@Body() createInviteDto: CreateInviteDto
	): Promise<void> {
		await this.invitesService.createInvite(createInviteDto);
	}

	/**
	 * Use an invite code to get redirected and set user credentials
	 */
	@Get(":inviteCode")
	@ApiExcludeEndpoint()
	async useInvite(
		@Res() res: Response,
		@Param("inviteCode") inviteCode: string
	) {
		const redirectUrl = await this.invitesService.useInvite(inviteCode);

		return res.redirect(redirectUrl);
	}

	/**
	 * Mark an invite as completed and redirect the user appropriately
	 */
	@Get("done/:inviteCode")
	@ApiExcludeEndpoint()
	async inviteDone(
		@Res() res: Response,
		@Param("inviteCode") inviteCode: string
	) {
		const redirectUrl = await this.invitesService.inviteDone(inviteCode);

		return res.redirect(redirectUrl);
	}
}
