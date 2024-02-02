import { User, Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_NAME } from 'src/utils/defaultName.constant';

export const afterCreateUserMiddleware: (
  prisma: PrismaClient,
) => Prisma.Middleware<User> = (prisma) => async (params, next) => {
  const user = await next(params);

  const { model, action } = params;
  const assetType = Math.floor(Math.random() * 30) + 1;

  if (model === 'User' && action === 'create') {
    await prisma.folder.create({
      data: {
        name: DEFAULT_NAME,
        user: { connect: { id: user.id } },
        assetType,
      },
    });
  }

  return user;
};
