import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

  // 系统提示词
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  // 用户提示词
  @IsOptional()
  @IsString()
  userPrompt?: string;

  // 随机性
  @IsOptional()
  @IsNumber()
  temperature?: number;

  // 最大token
  @IsOptional()
  @IsNumber()
  maxTokens?: number;
}
