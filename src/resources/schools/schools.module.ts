import { Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";

import { PrismaModule } from "@prisma/prisma.module";

import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";

@Module({
	controllers: [SchoolsController],
	providers: [SchoolsService],
	imports: [PrismaModule, OryModule],
	exports: [SchoolsService],
})
export class SchoolsModule {}
