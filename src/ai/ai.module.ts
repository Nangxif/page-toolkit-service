import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { PaymentApplyModule } from '../payment-apply/payment-apply.module';

@Module({
  imports: [PaymentApplyModule],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
