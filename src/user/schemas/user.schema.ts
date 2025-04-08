import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccountType } from '../../types';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: {
    createdAt: 'create_time',
    updatedAt: 'update_time',
  },
})
export class User {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: false })
  avatar?: string;
  @Prop({ type: String, required: false })
  username?: string;
  @Prop({ type: String, required: true })
  accountType: AccountType;
  @Prop({ type: String, required: true })
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
