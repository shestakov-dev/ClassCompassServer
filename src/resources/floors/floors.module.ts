import { Module } from "@nestjs/common";

import { BuildingsModule } from "@resources/buildings/buildings.module";
import { MinioModule } from "@resources/minio/minio.module";
import { OryModule } from "@resources/ory/ory.module";

import { PrismaModule } from "@prisma/prisma.module";

import { FloorsController } from "./floors.controller";
import { FloorsService } from "./floors.service";

@Module({
	controllers: [FloorsController],
	providers: [FloorsService],
	imports: [PrismaModule, BuildingsModule, OryModule, MinioModule],
	exports: [FloorsService],
})
export class FloorsModule {}
