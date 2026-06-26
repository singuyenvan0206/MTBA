import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for Next.js frontend
  app.useGlobalFilters(new HttpExceptionFilter()); // Use global exception filter for JSON responses
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); // Run backend on 3001
}
bootstrap();
