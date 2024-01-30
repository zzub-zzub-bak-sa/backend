import { User, Prisma, PrismaClient } from '@prisma/client';

export const afterCreateCustomerMiddleware: (
  prisma: PrismaClient,
) => Prisma.Middleware<User> = (prisma) => async (params, next) => {
  const user = await next(params);

  const { model, action } = params;
  const assetType = Math.floor(Math.random() * 30) + 1;

  if (model === 'User' && action === 'create') {
    await prisma.folder.create({
      data: {
        name: '기본 폴더',
        user: { connect: { id: user.id } },
        assetType,
      },
    });
  }

  return user;
};
