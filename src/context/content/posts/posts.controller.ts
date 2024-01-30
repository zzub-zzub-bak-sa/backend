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
import { PostsService } from './posts.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';

@Controller('/content/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':folderId')
  @Roles(ROLE.USER)
  getPosts(
    @User() user: TUser,
    @Param('folderId', ParseIntPipe) folderId: number,
  ) {
    return this.postsService.getPosts(user, folderId);
  }
}
