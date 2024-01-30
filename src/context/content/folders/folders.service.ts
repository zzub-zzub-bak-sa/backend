import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './folders.dto';
import { Exception, ExceptionCode } from 'src/app.exception';

@Injectable()
export class FoldersService {
  constructor(private prismaService: PrismaService) {}

  async createFolder(user: User, createFolderDto: CreateFolderDto) {
    const { id: userId } = user;
    const { name, assetType } = createFolderDto;
    await this.barrier_folderNameMustBeUnique(userId, name);

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

  private async barrier_folderNameMustBeUnique(userId: string, name: string) {
    const existingFolder = await this.prismaService.folder.findFirst({
      where: { userId, name },
    });

    if (existingFolder)
      throw new Exception(
        ExceptionCode.AlreadyUsedValue,
        '같은 이름의 폴더가 존재합니다.',
      );
  }
}
