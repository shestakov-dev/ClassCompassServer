import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

import {
	ACCESS_TOKEN_KEY,
	REFRESH_TOKEN_KEY,
} from "@shared/decorators/auth.decorator";
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
		.addServer("/")
		.addServer("http://localhost:8393")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			ACCESS_TOKEN_KEY
		)
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			REFRESH_TOKEN_KEY
		)
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			`${controllerKey}${methodKey.charAt(0).toUpperCase()}${methodKey.slice(1)}`,
	});

	const theme = new SwaggerTheme();

	SwaggerModule.setup("api", app, document, {
		customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
		customSiteTitle: "Class Compass API Docs",
		swaggerOptions: {
			docExpansion: "none", // collapse operations by default
			tagsSorter: "alpha", // sort tags alphabetically
		},
	});

	app.useGlobalFilters(new PrismaClientExceptionFilter());

	app.enableCors();

	await app.listen(process.env.PORT ?? 8393);
}

bootstrap();
