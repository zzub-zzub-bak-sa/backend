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
import { CreatePostDto, DeletePostsDto, RestorePostsDto } from './posts.dto';

@Controller('/content/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(ROLE.USER)
  createPost(@User() user: TUser, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user, createPostDto);
  }

  // 폴더 내 검색 기능
  @Get('search')
  @Roles(ROLE.USER)
  searchPosts(
    @User() user: TUser,
    @Query('keywords') keywords: string[],
    @Query('folderId') folderId: string,
  ) {
    return this.postsService.searchPosts(user, keywords, Number(folderId));
  }

  @Delete()
  @Roles(ROLE.USER)
  deletePosts(@User() user: TUser, @Body() deletePostsDto: DeletePostsDto) {
    return this.postsService.deletePosts(user, deletePostsDto);
  }

  @Delete()
  @Roles(ROLE.USER)
  deletePostsPermanently(
    @User() user: TUser,
    @Body() deletePostsDto: DeletePostsDto,
  ) {
    return this.postsService.deletePostsPermanently(user, deletePostsDto);
  }

  @Get('deleted')
  @Roles(ROLE.USER)
  getDeletedPosts(@User() user: TUser) {
    return this.postsService.getDeletedPosts(user);
  }

  @Put('restore')
  @Roles(ROLE.USER)
  restorePosts(@User() user: TUser, @Body() restorePostsDto: RestorePostsDto) {
    return this.postsService.restorePosts(user, restorePostsDto);
  }

  @Get(':id')
  @Roles(ROLE.USER)
  getPost(@User() user: TUser, @Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPost(user, id);
  }
}
