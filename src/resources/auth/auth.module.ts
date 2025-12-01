import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { OryModule } from "@resources/ory/ory.module";
import { UrlModule } from "@resources/url/url.module";
import { UsersModule } from "@resources/users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OidcService } from "./oidc.service";
import { OathkeeperStrategy } from "./strategies/oathkeeper.strategy";

@Module({
	imports: [OryModule, UrlModule, PassportModule, UsersModule],
	controllers: [AuthController],
	providers: [AuthService, OidcService, OathkeeperStrategy],
})
export class AuthModule {}
