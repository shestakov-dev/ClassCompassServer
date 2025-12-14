import { forwardRef, Module } from "@nestjs/common";

import { OryModule } from "@resources/ory/ory.module";
import { SchoolsModule } from "@resources/schools/schools.module";
import { TeachersModule } from "@resources/teachers/teachers.module";

import { PrismaModule } from "@prisma/prisma.module";

import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
	controllers: [SubjectsController],
	providers: [SubjectsService],
	imports: [
		PrismaModule,
		SchoolsModule,
		forwardRef(() => TeachersModule),
		OryModule,
	],
	exports: [SubjectsService],
})
export class SubjectsModule {}
