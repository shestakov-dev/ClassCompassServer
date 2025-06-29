import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

import { PrismaClientExceptionFilter } from "@shared/filters/prisma-client-exception/prisma-client-exception.filter";

import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);

	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector))
	);

	const config = new DocumentBuilder()
		.setTitle("Class Compass API")
		.setDescription("An API for the Class Compass application")
		.setVersion("1.0")
		.addServer("http://localhost:8393")
		.addServer("/")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"Access Token"
		)
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"Refresh Token"
		)
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		// TODO: create a custom operationIdFactory
		// operationIdFactory: (controllerKey: string, methodKey: string) =>
		// 	`${controllerKey}${methodKey}`,
	});

	const theme = new SwaggerTheme();

	SwaggerModule.setup("api", app, document, {
		customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
		customSiteTitle: "Class Compass API Docs",
	});

	app.useGlobalFilters(new PrismaClientExceptionFilter());

	app.enableCors();

	await app.listen(process.env.PORT ?? 8393);
}

bootstrap();
