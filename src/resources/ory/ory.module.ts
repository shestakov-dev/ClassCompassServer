import { Module } from "@nestjs/common";

import { UrlModule } from "@resources/url/url.module";

import { HydraController } from "./hydra/hydra.controller";
import { HydraService } from "./hydra/hydra.service";
import { KetoService } from "./keto/keto.service";
import { KratosController } from "./kratos/kratos.controller";
import { KratosService } from "./kratos/kratos.service";

@Module({
	imports: [UrlModule],
	providers: [KratosService, HydraService, KetoService],
	controllers: [HydraController, KratosController],
	exports: [KratosService, HydraService, KetoService],
})
export class OryModule {}
