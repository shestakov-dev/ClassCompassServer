import { Module } from "@nestjs/common";

import { EmailModule } from "@resources/email/email.module";
import { OryModule } from "@resources/ory/ory.module";
import { UrlModule } from "@resources/url/url.module";
import { UsersModule } from "@resources/users/users.module";

import { InvitesController } from "./invites.controller";
import { InvitesService } from "./invites.service";

@Module({
	imports: [OryModule, UrlModule, EmailModule, UsersModule],
	controllers: [InvitesController],
	providers: [InvitesService],
	exports: [InvitesService],
})
export class InvitesModule {}
