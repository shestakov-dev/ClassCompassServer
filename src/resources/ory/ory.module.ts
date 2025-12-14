import { Module } from "@nestjs/common";

import { UrlModule } from "@resources/url/url.module";

import { KetoService } from "./keto/keto.service";
import { KratosService } from "./kratos/kratos.service";

@Module({
	imports: [UrlModule],
	providers: [KratosService, KetoService],
	exports: [KratosService, KetoService],
})
export class OryModule {}
