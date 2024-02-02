import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import {
  CreatePostDto,
  DeletePostsDto,
  MovePostsDto,
  RestorePostsDto,
  UpdatePostDto,
} from './posts.dto';
import { getContentUrlByUrl } from 'src/utils/getContentUrlByUrl';
import { difference } from 'lodash';
import { DEFAULT_NAME } from 'src/utils/defaultName.constant';

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

    const contentUrl = await getContentUrlByUrl(url);
    const post = await this.prismaService.post.create({
      data: {
        url,
        contentUrl,
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

  async searchPosts(user: User, keywords: string[], folderId: number) {
    let postWhereInput: Prisma.PostWhereInput = {
      userId: user.id,
      isDeleted: false,
      folderId,
    };
    if (keywords.length) {
      const OR = keywords.map((keyword) => ({
        OR: [{ tags: { some: { name: { contains: keyword } } } }],
      }));
      postWhereInput = { ...postWhereInput, OR };
    }

    let posts: Record<string, any> = await this.prismaService.post.findMany({
      where: postWhereInput,
      include: { tags: true },
    });
    if (!posts) {
      posts = await this.prismaService.post
        .findMany({
          where: { userId: user.id, isDeleted: false, folderId },
          include: { _count: { select: { tags: true } } },
        })
        .then((posts) => posts.filter((post) => post._count.tags === 0));
    }

    return posts;
  }

  async deletePosts(user: User, deletePostsDto: DeletePostsDto) {
    const { postIds } = deletePostsDto;

    const posts = await this.prismaService.post.updateMany({
      where: { userId: user.id, id: { in: postIds } },
      data: { isDeleted: true },
    });

    return posts;
  }

  async deletePostsPermanently(user: User, deletePostsDto: DeletePostsDto) {
    const { postIds } = deletePostsDto;
    const posts = await this.prismaService.post.deleteMany({
      where: { id: { in: postIds } },
    });

    return posts;
  }

  async movePosts(user: User, movePostsDto: MovePostsDto) {
    const { postIds, folderId } = movePostsDto;

    const posts = await this.prismaService.post.updateMany({
      where: { userId: user.id, id: { in: postIds } },
      data: { folderId },
    });

    return posts;
  }

  async getPost(user: User, id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { userId: user.id, id },
      include: { tags: true },
    });

    return post;
  }

  async updatePost(user: User, postId: number, updatePostDto: UpdatePostDto) {
    const { tags } = updatePostDto;
    const prevPost = await this.prismaService.post.findUnique({
      where: { id: postId, userId: user.id },
      include: { tags: true },
    });
    const prevTagNames = prevPost.tags
      ? prevPost.tags.map((tag) => tag.name)
      : [];

    const disconnect = difference(prevTagNames, tags).map((name) => ({ name }));
    const connectOrCreate = difference(tags, prevTagNames).map((name) => ({
      where: { name },
      create: { name },
    }));

    const post = await this.prismaService.post.update({
      where: { id: postId, userId: user.id },
      data: {
        tags: {
          disconnect,
          connectOrCreate,
        },
      },
      include: { tags: true },
    });

    return post;
  }

  async getDeletedPosts(user: User) {
    const posts = await this.prismaService.post.findMany({
      where: { userId: user.id, isDeleted: true },
      include: { tags: true },
    });

    return posts;
  }

  async restorePosts(user: User, restorePostsDto: RestorePostsDto) {
    const { postIds } = restorePostsDto;
    const defaultFolder = await this.prismaService.folder.findFirst({
      where: { userId: user.id, name: DEFAULT_NAME },
      select: { id: true },
    });

    const restoredPosts = await this.prismaService.post.updateMany({
      where: { id: { in: postIds } },
      data: { isDeleted: false, folderId: defaultFolder.id },
    });

    return restoredPosts;
  }
}
