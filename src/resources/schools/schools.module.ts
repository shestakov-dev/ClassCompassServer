import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { OryModule } from "@resources/ory/ory.module";
import { UsersModule } from "@resources/users/users.module";

import { PrismaModule } from "@prisma/prisma.module";

import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";

@Module({
	controllers: [SchoolsController],
	providers: [SchoolsService],
	imports: [
		PrismaModule,
		OryModule,
		ConfigModule,
		forwardRef(() => UsersModule),
	],
	exports: [SchoolsService],
})
export class SchoolsModule {}
