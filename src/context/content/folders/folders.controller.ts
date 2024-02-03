import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';
import { CreateFolderDto, UpdateFolderDto } from './folders.dto';
import { FolderSortType } from './folders.type';
import { ParseBooleanPipe } from 'src/app.pipe';
import { PostSortType } from '../posts/posts.type';

@Controller('/content/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @Roles(ROLE.USER)
  createFolder(@User() user: TUser, @Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.createFolder(user, createFolderDto);
  }

  @Get('by-sharing')
  @Roles(ROLE.USER)
  getFoldersBySharing(@User() user: TUser, @Query('keyword') keyword?: string) {
    return this.foldersService.getFoldersBySharing(user, keyword);
  }

  @Get('home')
  @Roles(ROLE.USER)
  getFoldersForHome(@User() user: TUser, @Query('sort') sort?: FolderSortType) {
    return this.foldersService.getFoldersForHome(user, sort);
  }

  @Get('search')
  @Roles(ROLE.USER)
  search(
    @User() user: TUser,
    @Query('keyword') keyword?: string,
    @Query('folderOnly', ParseBooleanPipe) folderOnly?: boolean,
  ) {
    return this.foldersService.search(user, keyword, folderOnly);
  }

  @Get('auto-complete')
  @Roles(ROLE.USER)
  autoComplete(
    @User() user: TUser,
    @Query('keyword') keyword?: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.foldersService.autoComplete(
      user,
      keyword,
      folderId ? Number(folderId) : undefined,
    );
  }

  @Get(':id')
  @Roles(ROLE.USER)
  getFolder(
    @User() user: TUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort: PostSortType,
  ) {
    return this.foldersService.getFolder(user, id, sort);
  }

  @Put(':id')
  @Roles(ROLE.USER)
  updateFolder(
    @User() user: TUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(user, id, updateFolderDto);
  }

  @Delete(':id')
  @Roles(ROLE.USER)
  deleteFolder(@User() user: TUser, @Param('id', ParseIntPipe) id: number) {
    return this.foldersService.deleteFolder(user, id);
  }
}
