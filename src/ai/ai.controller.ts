import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { AskModelDto } from './dto/ai.dto';

@Controller('api')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('ai/ask')
  @UseGuards(AuthGuard('normal'))
  async askModel(@Req() req, @Body() body: AskModelDto) {
    return this.aiService.askModel(req.user, body);
  }
}
