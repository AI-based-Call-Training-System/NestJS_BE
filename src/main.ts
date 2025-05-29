import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000; // 포트 번호
  app.enableCors(); // CORS 전체 허용 (개발용)
  await app.listen(Number(port));
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
});
