import { randomBytes } from "crypto";
import { join } from "path";

import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Redis } from "ioredis";

import { EmailService } from "@resources/email/email.service";
import { KratosService } from "@resources/ory/kratos/kratos.service";
import { UrlService } from "@resources/url/url.service";
import { UsersService } from "@resources/users/users.service";

import { CreateInviteDto } from "./dto/create-invite.dto";

@Injectable()
export class InvitesService {
	private readonly LOGO_URL = join(
		__dirname,
		"..",
		"..",
		"..",
		"assets",
		"images",
		"ClassCompassLogo.png"
	);

	constructor(
		@InjectRedis() private readonly redis: Redis,
		private readonly usersService: UsersService,
		private readonly kratosService: KratosService,
		private readonly urlService: UrlService,
		private readonly emailService: EmailService
	) {}

	// Separate method to create invite by identity ID for the bootstrap process
	async createInviteWithIdentityId(
		email: string,
		firstName: string,
		lastName: string,
		identityId: string,
		ttlSeconds?: number
	): Promise<void> {
		const identityExists =
			await this.kratosService.identityExists(identityId);

		if (!identityExists) {
			throw new NotFoundException("Identity not found");
		}

		const inviteCode = await this.generateInviteCode(
			identityId,
			ttlSeconds
		);

		const inviteUrl = this.urlService.getInviteUrl(inviteCode).toString();

		await this.emailService.sendEmail({
			email,
			subject: "Welcome! You're invited to join our platform",
			template: "onboarding",
			context: {
				inviteUrl,
				firstName,
				lastName,
			},
			attachments: [
				{
					filename: "logo.png",
					cid: "logo",
					path: this.LOGO_URL,
				},
			],
		});
	}

	async createInvite(createInviteDto: CreateInviteDto): Promise<void> {
		const { userId, ttlSeconds } = createInviteDto;

		const { identityId, firstName, lastName, email } =
			await this.usersService.findOne(userId);

		const identityExists =
			await this.kratosService.identityExists(identityId);

		if (!identityExists) {
			throw new NotFoundException("Identity not found");
		}

		await this.createInviteWithIdentityId(
			email,
			firstName,
			lastName,
			identityId,
			ttlSeconds
		);
	}

	async useInvite(inviteCode: string): Promise<string> {
		const identityId = await this.validateInviteCode(inviteCode);

		if (!identityId) {
			throw new UnauthorizedException("Invalid or expired invite code");
		}

		const identityExists =
			await this.kratosService.identityExists(identityId);

		if (!identityExists) {
			throw new NotFoundException("Identity not found");
		}

		const returnToUrl = this.urlService.getInviteDoneUrl(inviteCode);

		const recoveryUrlString = await this.kratosService.createRecoveryLink(
			identityId,
			returnToUrl.toString()
		);

		// verify the identity's email in the background
		this.kratosService.verifyIdentityEmail(identityId);

		const recoveryUrl = new URL(recoveryUrlString);

		// set a flow hint to indicate this is an invite flow
		// this can be used by the frontend to customize the UI/UX
		recoveryUrl.searchParams.set("flow_hint", "invite");

		return recoveryUrl.toString();
	}

	async inviteDone(inviteCode: string): Promise<string> {
		const identityId = await this.validateInviteCode(inviteCode);

		if (!identityId) {
			throw new UnauthorizedException("Invalid or expired invite code");
		}

		await this.revokeInviteCode(inviteCode);

		return this.urlService.getDefaultRedirectUrl().toString();
	}

	private getRedisKey(inviteCode: string): string {
		return `invite:${inviteCode}`;
	}

	private async generateInviteCode(
		identityId: string,
		ttlSeconds: number = 30 * 24 * 60 * 60
	): Promise<string> {
		let inviteCode = randomBytes(32).toString("hex");

		let redisKey = this.getRedisKey(inviteCode);

		// Ensure the invite code is unique
		while (await this.redis.exists(redisKey)) {
			inviteCode = randomBytes(32).toString("hex");

			redisKey = this.getRedisKey(inviteCode);
		}

		await this.redis.setex(redisKey, ttlSeconds, identityId);

		return inviteCode;
	}

	private async validateInviteCode(
		inviteCode: string
	): Promise<string | null> {
		const redisKey = this.getRedisKey(inviteCode);

		const identityId = await this.redis.get(redisKey);

		return identityId ?? null;
	}

	private async revokeInviteCode(inviteCode: string): Promise<void> {
		const redisKey = this.getRedisKey(inviteCode);

		await this.redis.del(redisKey);
	}
}
