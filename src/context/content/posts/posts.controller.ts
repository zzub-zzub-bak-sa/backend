import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';
import { CreatePostDto } from './posts.dto';

@Controller('/content/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(ROLE.USER)
  createPost(@User() user: TUser, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user, createPostDto);
  }
}
