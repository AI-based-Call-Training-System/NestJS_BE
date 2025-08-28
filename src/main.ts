import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000; // 포트 번호

  app.enableCors({
    origin: true,
    credentials: false,
  });
  //app.enableCors(); // CORS 전체 허용 (개발용)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(Number(port));
}
void bootstrap();
