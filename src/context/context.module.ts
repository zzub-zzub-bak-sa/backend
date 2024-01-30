import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [AccountModule, ContentModule],
})
export class ContextModule {}
