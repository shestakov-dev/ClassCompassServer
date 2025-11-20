import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "@nestjs-modules/ioredis";

import { BuildingsModule } from "@resources/buildings/buildings.module";
import { ClassesModule } from "@resources/classes/classes.module";
import { DailySchedulesModule } from "@resources/daily-schedules/daily-schedules.module";
import { FloorsModule } from "@resources/floors/floors.module";
import { LessonsModule } from "@resources/lessons/lessons.module";
import { RolesModule } from "@resources/roles/roles.module";
import { RoomsModule } from "@resources/rooms/rooms.module";
import { SchoolsModule } from "@resources/schools/schools.module";
import { StudentsModule } from "@resources/students/students.module";
import { SubjectsModule } from "@resources/subjects/subjects.module";
import { TeachersModule } from "@resources/teachers/teachers.module";
import { UsersModule } from "@resources/users/users.module";

import { AppController } from "./app.controller";

@Module({
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
		RolesModule,
		BuildingsModule,
		SubjectsModule,
		FloorsModule,
		RoomsModule,
		DailySchedulesModule,
		LessonsModule,
	],
	controllers: [AppController],
})
export class AppModule {}
