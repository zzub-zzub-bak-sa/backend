import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './folders.dto';
import { Exception, ExceptionCode } from 'src/app.exception';
import { FolderSortType } from './folders.type';
import { PostsService } from '../posts/posts.service';
import { TagsService } from '../tags/tags.service';
import { uniq } from 'lodash';

@Injectable()
export class FoldersService {
  constructor(
    private prismaService: PrismaService,
    private readonly postsService: PostsService,
    private readonly tagsService: TagsService,
  ) {}

  async createFolder(user: User, createFolderDto: CreateFolderDto) {
    const { id: userId } = user;
    const { name, assetType } = createFolderDto;
    await this.barrier_folderNameMustBeUniqueWhenCreatingFolder(userId, name);

    const folder = await this.prismaService.folder.create({
      data: { name, user: { connect: { id: userId } }, assetType },
    });

    return folder;
  }

  async getFoldersBySharing(user: User, keyword?: string) {
    const { id: userId } = user;
    if (!keyword?.length) keyword = undefined;

    let folderWhereInput: Prisma.FolderWhereInput = {
      userId,
      isDeleted: false,
    };
    if (keyword) {
      folderWhereInput = {
        ...folderWhereInput,
        name: { contains: keyword },
      };
    }

    const folders = await this.prismaService.folder.findMany({
      where: folderWhereInput,
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });

    return folders;
  }

  async getFoldersForHome(user: User, sort?: FolderSortType) {
    const { id: userId } = user;

    const folders = await this.prismaService.folder.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy:
        sort === 'newest'
          ? { createdAt: 'desc' }
          : sort === 'oldest'
          ? { createdAt: 'asc' }
          : { name: 'asc' },
    });

    return folders;
  }

  // 홈화면 검색
  async search(user: User, keyword: string) {
    if (!keyword || !keyword?.length) return;

    const folders = await this.prismaService.folder.findMany({
      where: { userId: user.id, name: { contains: keyword }, isDeleted: false },
    });
    const posts = await this.postsService.getPostsByKeyword(user, keyword);

    return { folders, posts };
  }

  async autoComplete(user: User, keyword: string) {
    if (!keyword || !keyword?.length) return;
    const folderNames = await this.prismaService.folder
      .findMany({
        where: {
          userId: user.id,
          name: { contains: keyword },
          isDeleted: false,
        },
        select: { name: true },
      })
      .then((folders) => folders.map((folder) => folder.name));
    const tags = await this.tagsService.getTags(user, keyword);

    return uniq([...folderNames, ...tags]);
  }

  async getFolder(user: User, id: number) {
    const folder = await this.prismaService.folder.findUnique({
      where: { id, userId: user.id },
      include: {
        posts: { where: { isDeleted: false }, include: { tags: true } },
      },
    });
    if (!folder) throw new Exception(ExceptionCode.NotFound);
    if (folder.isDeleted)
      throw new Exception(ExceptionCode.BadRequest, '삭제된 폴더입니다.');

    return folder;
  }

  async updateFolder(user: User, id: number, updateFolderDto: UpdateFolderDto) {
    const { assetType, name } = updateFolderDto;
    this.barrier_folderNameMustBeUniqueWhenUpdatingFolder(id, name);
    const folder = await this.prismaService.folder.update({
      where: { id, userId: user.id },
      data: { assetType, name },
    });

    return folder;
  }

  async deleteFolder(user: User, id: number) {
    const folder = await this.prismaService.folder.update({
      where: { id, userId: user.id },
      data: {
        isDeleted: true,
        posts: {
          updateMany: { where: { folderId: id }, data: { isDeleted: true } },
        },
      },
    });

    return folder;
  }

  async restoreFolder(user: User, id: number) {
    const folder = await this.prismaService.folder.update({
      where: { id, userId: user.id },
      data: {
        isDeleted: false,
        posts: {
          updateMany: { where: { folderId: id }, data: { isDeleted: false } },
        },
      },
    });

    return folder;
  }

  private async barrier_folderNameMustBeUniqueWhenCreatingFolder(
    userId: string,
    name: string,
  ) {
    const existingFolder = await this.prismaService.folder.findFirst({
      where: { userId, name },
    });

    if (existingFolder)
      throw new Exception(
        ExceptionCode.AlreadyUsedValue,
        '같은 이름의 폴더가 존재합니다.',
      );
  }

  private async barrier_folderNameMustBeUniqueWhenUpdatingFolder(
    folderId: number,
    name: string,
  ) {
    const existingFolder = await this.prismaService.folder.findFirst({
      where: { id: { not: folderId }, name },
    });

    if (existingFolder)
      throw new Exception(
        ExceptionCode.AlreadyUsedValue,
        '같은 이름의 폴더가 존재합니다.',
      );
  }
}
