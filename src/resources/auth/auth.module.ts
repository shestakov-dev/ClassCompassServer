import { Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";
import { UrlModule } from "@resources/url/url.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OidcService } from "./oidc.service";

@Module({
	imports: [OryModule, UrlModule],
	controllers: [AuthController],
	providers: [AuthService, OidcService],
})
export class AuthModule {}
