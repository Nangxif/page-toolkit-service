import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentWay } from 'src/types';
export class GetEmailCodeDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyEmailCodeDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  code: string;
}

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
