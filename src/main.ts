import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import helmet from 'helmet';
import * as requestIp from 'request-ip';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

async function bootstrap() {
  const privateKey = fs.readFileSync(
    '/etc/letsencrypt/live/mokkitlink.store/privkey.pem',
  );
  const certificate = fs.readFileSync(
    '/etc/letsencrypt/live/mokkitlink.store/cert.pem',
  );
  const ca = fs.readFileSync(
    '/etc/letsencrypt/live/mokkitlink.store/fullchain.pem',
  );
  const httpsOptions = { key: privateKey, cert: certificate, ca: ca };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // MiddleWares
  app.use(requestIp.mw());
  app.use(bodyParser.text());
  app.use(helmet());

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(8000);

  const httpServer = http.createServer(app.getHttpAdapter().getInstance());
  httpServer.listen(80, () => {
    console.log('HTTP Server running on port 8000');
  });

  const httpsServer = https.createServer(
    httpsOptions,
    app.getHttpAdapter().getInstance(),
  );
  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
}
bootstrap();
