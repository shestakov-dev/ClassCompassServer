import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import { AccessTokenGuard } from "@resources/auth/guards/access-token.guard";
import { AttributesGuard } from "@resources/auth/guards/attributes.guard";
import { RefreshTokenGuard } from "@resources/auth/guards/refresh-token.guard";
import { ClassesModule } from "@resources/classes/classes.module";
import { SchoolsModule } from "@resources/schools/schools.module";
import { StudentsModule } from "@resources/students/students.module";
import { TeachersModule } from "@resources/teachers/teachers.module";

import { AuthModule } from "./resources/auth/auth.module";
import { RolesModule } from "./resources/roles/roles.module";
import { SessionsModule } from "./resources/sessions/sessions.module";
import { UsersModule } from "./resources/users/users.module";

@Module({
	providers: [
		{
			provide: APP_GUARD,
			useClass: RefreshTokenGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AccessTokenGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AttributesGuard,
		},
	],
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		SchoolsModule,
		TeachersModule,
		ClassesModule,
		StudentsModule,
		UsersModule,
		AuthModule,
		RolesModule,
		SessionsModule,
	],
})
export class AppModule {}
