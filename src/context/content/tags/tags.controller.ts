import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';

@Controller('/content/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Roles(ROLE.USER)
  getTags(@User() user: TUser, @Query('keyword') keyword?: string) {
    return this.tagsService.getTags(user, keyword);
  }

  // 폴더 내 태그 검색시 폴더에 등록된 태그
  @Get('/folders/:folderId')
  @Roles(ROLE.USER)
  getTagsByFolderId(
    @User() user: TUser,
    @Param('folderId', ParseIntPipe) folderId: number,
  ) {
    return this.tagsService.getTagsByFolderId(user, folderId);
  }
}
