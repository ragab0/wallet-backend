import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { NextFunction, Request, Response } from "express";
import pinoHttp from "pino-http";
import * as cookieParser from "cookie-parser";

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.use(cookieParser());

  // logger setup:
  app.useLogger(app.get(Logger));
  app.use(
    pinoHttp({
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }),
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    const oldSend = res.send;
    res.send = function (body) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.log.info({ responseBody: body }, "Response sent");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return oldSend.call(this, body);
    };
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Green-Wallet API")
    .setDescription("Green-Wallet API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // a global prefix
  app.setGlobalPrefix("api/v1", {
    exclude: [
      { path: "docs", method: RequestMethod.ALL },
      { path: "/", method: RequestMethod.GET },
    ],
  });

  await app.listen(PORT);
  console.log("server is lestining on:", PORT);
}

bootstrap();
