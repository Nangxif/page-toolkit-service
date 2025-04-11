import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
