import { IsNotEmpty, IsString } from 'class-validator';
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

export class UpdateUserInfoDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}

export class EmailLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class PasswordLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
