import { Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";
import { SchoolsModule } from "@resources/schools/schools.module";

import { PrismaModule } from "@prisma/prisma.module";

import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";

@Module({
	controllers: [ClassesController],
	providers: [ClassesService],
	imports: [PrismaModule, SchoolsModule, OryModule],
	exports: [ClassesService],
})
export class ClassesModule {}
