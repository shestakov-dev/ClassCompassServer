import { Module } from "@nestjs/common";

import { FloorsModule } from "@resources/floors/floors.module";
import { OryModule } from "@resources/ory/ory.module";

import { PrismaModule } from "@prisma/prisma.module";

import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";

@Module({
	controllers: [RoomsController],
	providers: [RoomsService],
	imports: [PrismaModule, FloorsModule, OryModule],
	exports: [RoomsService],
})
export class RoomsModule {}
