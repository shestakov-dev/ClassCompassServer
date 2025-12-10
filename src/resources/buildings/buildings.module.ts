import { Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";
import { SchoolsModule } from "@resources/schools/schools.module";

import { PrismaModule } from "@prisma/prisma.module";

import { BuildingsController } from "./buildings.controller";
import { BuildingsService } from "./buildings.service";

@Module({
	controllers: [BuildingsController],
	providers: [BuildingsService],
	imports: [PrismaModule, SchoolsModule, OryModule],
	exports: [BuildingsService],
})
export class BuildingsModule {}
