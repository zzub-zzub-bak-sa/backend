import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { PostsModule } from '../posts/posts.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [PostsModule, TagsModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
