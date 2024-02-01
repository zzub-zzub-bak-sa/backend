import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { CreatePostDto } from './posts.dto';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  async createPost(user: User, createPostDto: CreatePostDto) {
    const { folderId, tags: tagNames, url } = createPostDto;

    const tagsConnect = [];
    for (const tagName of tagNames) {
      let tag = await this.prismaService.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await this.prismaService.tag.create({ data: { name: tagName } });
      }

      tagsConnect.push({ id: tag.id });
    }

    const post = await this.prismaService.post.create({
      data: {
        url,
        user: { connect: { id: user.id } },
        folder: { connect: { id: folderId } },
        tags: { connect: tagsConnect },
      },
      include: { tags: true },
    });

    return post;
  }

  async getPostsByKeyword(user: User, keyword: string) {
    const posts = await this.prismaService.post.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
        tags: { some: { name: { contains: keyword } } },
      },
      include: { tags: { where: { name: { contains: keyword } }, take: 1 } },
    });

    return posts;
  }
}
