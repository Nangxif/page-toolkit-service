import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TryUseTimesDocument = HydratedDocument<TryUseTimes>;

@Schema({
  timestamps: {
    createdAt: 'create_time',
    updatedAt: 'update_time',
  },
})
export class TryUseTimes {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;
  @Prop({ type: Number, required: true, default: 0 })
  times: number;
}

export const TryUseTimesSchema = SchemaFactory.createForClass(TryUseTimes);
