import { Module } from "@nestjs/common";

import { ClassesModule } from "@resources/classes/classes.module";
import { OryModule } from "@resources/ory/ory.module";

import { PrismaModule } from "@prisma/prisma.module";

import { DailySchedulesController } from "./daily-schedules.controller";
import { DailySchedulesService } from "./daily-schedules.service";

@Module({
	controllers: [DailySchedulesController],
	providers: [DailySchedulesService],
	imports: [PrismaModule, ClassesModule, OryModule],
	exports: [DailySchedulesService],
})
export class DailySchedulesModule {}
