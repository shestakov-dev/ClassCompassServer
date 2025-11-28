import { Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";
import { UrlModule } from "@resources/url/url.module";
import { UsersModule } from "@resources/users/users.module";

import { InvitesController } from "./invites.controller";
import { InvitesService } from "./invites.service";

@Module({
	imports: [OryModule, UrlModule, UsersModule],
	controllers: [InvitesController],
	providers: [InvitesService],
})
export class InvitesModule {}
