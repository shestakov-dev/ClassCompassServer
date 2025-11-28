import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { UrlService } from "./url.service";

@Module({
	imports: [ConfigModule],
	providers: [UrlService],
	exports: [UrlService],
})
export class UrlModule {}
