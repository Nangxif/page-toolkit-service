import { Module } from '@nestjs/common';
import { PaymentApplyController } from './payment-apply.controller';
import { PaymentApplyService } from './payment-apply.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentApply,
  PaymentApplySchema,
} from './schemas/payment-apply.schema';
import { TryUseTimes, TryUseTimesSchema } from './schemas/try-use-times.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentApply.name, schema: PaymentApplySchema },
      { name: TryUseTimes.name, schema: TryUseTimesSchema },
    ]),
  ],
  controllers: [PaymentApplyController],
  providers: [PaymentApplyService],
  exports: [PaymentApplyService],
})
export class PaymentApplyModule {}
