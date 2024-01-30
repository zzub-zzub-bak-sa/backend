import { Module } from '@nestjs/common';
import { FoldersModule } from './folders/folders.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [FoldersModule, PostsModule, TagsModule],
})
export class ContentModule {}
