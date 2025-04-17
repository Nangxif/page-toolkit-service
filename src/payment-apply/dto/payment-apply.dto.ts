import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentWay } from '../../types';

export class PayApplyDto {
  @IsNotEmpty()
  @IsEnum(PaymentWay, {
    message: 'paymentWay 必须是有效的枚举值',
  })
  paymentWay: PaymentWay;
  @IsNotEmpty()
  @IsString()
  serialNumber: string;
}
