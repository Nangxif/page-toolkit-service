import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ModelType } from 'src/types';

export class AskModelDto {
  @IsNotEmpty()
  @IsEnum(ModelType, {
    message: 'model 必须是有效的枚举值',
  })
  model: ModelType;
  @IsNotEmpty()
  @IsString()
  apiKey: string;
  @IsNotEmpty()
  @IsString()
  content: string;
}
