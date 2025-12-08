import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { OryModule } from "@resources/ory/ory.module";
import { UsersModule } from "@resources/users/users.module";

import { OathkeeperStrategy } from "./strategies/oathkeeper.strategy";

@Module({
	imports: [PassportModule, UsersModule, OryModule],
	providers: [OathkeeperStrategy],
})
export class AuthModule {}
