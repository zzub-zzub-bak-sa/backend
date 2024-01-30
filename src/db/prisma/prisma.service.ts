// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { afterCreateUserMiddleware } from './middlewares/afterCreateUser.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async useMiddlewares() {
    this.$use(afterCreateUserMiddleware(this));
  }
}
