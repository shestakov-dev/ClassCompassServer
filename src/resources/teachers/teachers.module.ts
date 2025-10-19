import { forwardRef, Module } from "@nestjs/common";

import { SubjectsModule } from "@resources/subjects/subjects.module";
import { UsersModule } from "@resources/users/users.module";

import { PrismaModule } from "@prisma/prisma.module";

import { TeachersController } from "./teachers.controller";
import { TeachersService } from "./teachers.service";

@Module({
	controllers: [TeachersController],
	providers: [TeachersService],
	imports: [PrismaModule, UsersModule, forwardRef(() => SubjectsModule)],
	exports: [TeachersService],
})
export class TeachersModule {}
