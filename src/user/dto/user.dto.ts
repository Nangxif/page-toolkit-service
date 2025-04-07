import { IsNotEmpty } from 'class-validator';
export class GetEmailCodeDto {
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailCodeDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  code: string;
}

export class LoginDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  code: string;
}
