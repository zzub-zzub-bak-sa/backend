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

@Controller('/content/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @Roles(ROLE.USER)
  createFolder(@User() user: TUser, @Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.createFolder(user, createFolderDto);
  }

  @Get()
  @Roles(ROLE.USER)
  getFoldersBySharing(@User() user: TUser, @Query('keyword') keyword?: string) {
    return this.foldersService.getFoldersBySharing(user, keyword);
  }

  @Get(':id')
  @Roles(ROLE.USER)
  getFolder(@User() user: TUser, @Param('id', ParseIntPipe) id: number) {
    return this.foldersService.getFolder(user, id);
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

  @Put(':id/restore')
  @Roles(ROLE.USER)
  restoreFolder(@User() user: TUser, @Param('id', ParseIntPipe) id: number) {
    return this.foldersService.restoreFolder(user, id);
  }
}
