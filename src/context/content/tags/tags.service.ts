import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { uniq } from 'lodash';

@Injectable()
export class TagsService {
  constructor(private prismaService: PrismaService) {}

  async getTags(user: User, keyword?: string) {
    const tags = uniq(
      await this.prismaService.post
        .findMany({
          where: { userId: user.id, isDeleted: false },
          select: { tags: { select: { name: true } } },
        })
        .then((posts) =>
          posts.flatMap((post) => post.tags.map((tag) => tag.name)),
        ),
    );

    // TODO 자동완성 고도화시 hangul-js 라이브러리 사용
    if (keyword) return tags.filter((tag) => tag.includes(keyword));

    return tags;
  }

  async getTagsByFolderId(user: User, folderId: number, keyword?: string) {
    const tags = uniq(
      await this.prismaService.folder
        .findUnique({
          where: { userId: user.id, id: folderId },
          select: {
            posts: {
              where: { isDeleted: false },
              select: {
                tags: {
                  where: { name: keyword ? { contains: keyword } : {} },
                  select: { name: true },
                },
              },
            },
          },
        })
        .then((folder) =>
          folder.posts.flatMap((post) => post.tags.map((tag) => tag.name)),
        ),
    );

    return tags;
  }
}
