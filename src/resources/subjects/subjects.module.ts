import { forwardRef, Module } from "@nestjs/common";

import { SchoolsModule } from "@resources/schools/schools.module";
import { TeachersModule } from "@resources/teachers/teachers.module";

import { PrismaModule } from "@prisma/prisma.module";

import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
	controllers: [SubjectsController],
	providers: [SubjectsService],
	imports: [PrismaModule, SchoolsModule, forwardRef(() => TeachersModule)],
	exports: [SubjectsService],
})
export class SubjectsModule {}
