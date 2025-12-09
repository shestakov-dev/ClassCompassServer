import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

import { EmailService } from "./email.service";

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				transport: configService.getOrThrow<string>(
					"SMTP_CONNECTION_STRING"
				),
				defaults: {
					from: {
						address:
							configService.getOrThrow<string>("SMTP_FROM_EMAIL"),
						name: configService.getOrThrow<string>(
							"SMTP_FROM_NAME"
						),
					},
				},
				template: {
					dir: `${__dirname}/templates`,
					adapter: new HandlebarsAdapter(),
					options: {
						strict: true,
					},
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
