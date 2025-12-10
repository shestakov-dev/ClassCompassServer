import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { OryModule } from "@resources/ory/ory.module";

import { OathkeeperStrategy } from "./strategies/oathkeeper.strategy";

@Module({
	imports: [PassportModule, OryModule],
	providers: [OathkeeperStrategy],
})
export class AuthModule {}
