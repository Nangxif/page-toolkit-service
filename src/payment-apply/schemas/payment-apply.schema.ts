import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentStatus, PaymentWay } from '../../types';

export type PaymentApplyDocument = HydratedDocument<PaymentApply>;

@Schema({
  timestamps: {
    createdAt: 'create_time',
    updatedAt: 'update_time',
  },
})
export class PaymentApply {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;
  @Prop({ type: String, required: false })
  paymentWay: PaymentWay;
  @Prop({ type: String, required: false })
  serialNumber: string;
  @Prop({ type: String, required: true, default: PaymentStatus.NO_PAY })
  paymentStatus: PaymentStatus;
  // 审批时间
  @Prop({ type: Number, required: false })
  approvalTime?: number;
}

export const PaymentApplySchema = SchemaFactory.createForClass(PaymentApply);
