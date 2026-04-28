import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3005',
        /\.vercel\.app$/,
      ];

      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.some((pattern) => {
        if (typeof pattern === 'string') {
          return pattern === origin;
        }
        return pattern.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
