import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "@nestjs-modules/ioredis";

import { AuthModule } from "@resources/auth/auth.module";
import { OathkeeperIdTokenGuard } from "@resources/auth/guards/oathkeeper.guard";
import { BuildingsModule } from "@resources/buildings/buildings.module";
import { ClassesModule } from "@resources/classes/classes.module";
import { DailySchedulesModule } from "@resources/daily-schedules/daily-schedules.module";
import { EmailModule } from "@resources/email/email.module";
import { FloorsModule } from "@resources/floors/floors.module";
import { InvitesModule } from "@resources/invites/invites.module";
import { LessonsModule } from "@resources/lessons/lessons.module";
import { OryModule } from "@resources/ory/ory.module";
import { RoomsModule } from "@resources/rooms/rooms.module";
import { SchoolsModule } from "@resources/schools/schools.module";
import { StudentsModule } from "@resources/students/students.module";
import { SubjectsModule } from "@resources/subjects/subjects.module";
import { TeachersModule } from "@resources/teachers/teachers.module";
import { UrlModule } from "@resources/url/url.module";
import { UsersModule } from "@resources/users/users.module";

import { BootstrapService } from "./bootstrap.service";

@Module({
	providers: [
		{
			provide: APP_GUARD,
			useClass: OathkeeperIdTokenGuard,
		},
		BootstrapService,
	],
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		RedisModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				options: {
					host: configService.getOrThrow<string>("REDIS_HOST"),
					port: configService.getOrThrow<number>("REDIS_PORT"),
					username:
						configService.getOrThrow<string>("REDIS_USERNAME"),
					password:
						configService.getOrThrow<string>("REDIS_PASSWORD"),
				},
				type: "single",
			}),
			inject: [ConfigService],
		}),
		ScheduleModule.forRoot(),
		SchoolsModule,
		TeachersModule,
		ClassesModule,
		StudentsModule,
		UsersModule,
		BuildingsModule,
		SubjectsModule,
		FloorsModule,
		RoomsModule,
		DailySchedulesModule,
		LessonsModule,
		AuthModule,
		InvitesModule,
		OryModule,
		UrlModule,
		EmailModule,
	],
})
export class AppModule {}
