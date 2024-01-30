import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async getPosts(user: User, folderId: number) {
    const posts = await this.prismaService.post.findMany({
      where: { userId: user.id, folderId },
      orderBy: { createdAt: 'desc' },
    });

    return posts;
  }
}
