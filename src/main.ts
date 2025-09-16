import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RequestMethod, ValidationPipe } from "@nestjs/common";

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
