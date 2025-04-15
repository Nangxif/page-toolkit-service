import { Injectable } from '@nestjs/common';
import { PaymentStatus, UserInfo } from '../types';
import { AskModelDto } from './dto/ai.dto';
import OpenAI from 'openai';
import { aiModelMap, ResponseCode } from '../constants';
import { UserService } from '../user/user.service';

@Injectable()
export class AIService {
  constructor(private readonly userService: UserService) {}
  async askModel(user: UserInfo, data: AskModelDto) {
    const userInfo = await this.userService.getPayApplyInfo(user);
    if (userInfo.data.paymentStatus !== PaymentStatus.REVIEWED) {
      return {
        code: ResponseCode.ERROR,
        message: '您的账号暂未开通此功能',
        data: null,
      };
    }
    const { model, apiKey, content } = data;

    const openai = new OpenAI({
      baseURL: aiModelMap[model].api,
      apiKey,
    });
    const { summary, tokenUsage, timeUsed } = await this.summarizeText(
      openai,
      aiModelMap[model].model,
      content,
    );
    return {
      code: ResponseCode.SUCCESS,
      message: '成功总结内容',
      data: { summary, tokenUsage, timeUsed },
    };
  }

  // 文本总结函数
  async summarizeText(openai: OpenAI, model, text) {
    try {
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是一个专业的智能文本总结助手，请根据以下要求处理用户提供的页面内容：
            1. 分析文本的主题结构和信息层级
            2. 识别并保留核心观点、关键数据和重要结论
            3. 采用清晰的分点式或段落式输出
            4. 保持客观中立，不添加原文没有的内容
            5. 根据内容复杂度自动调整总结长度（通常为原文的15-30%）
            6. 特别关注：数字数据、专业术语、因果关系和对比关系
            7. 对技术性内容保持术语准确性
            8. 如内容较多，可先提取章节要点再整体归纳`,
          },
          {
            role: 'user',
            content: `请为以下页面内容生成专业摘要，要求重点突出、层次分明：
                  
            ${text}
            
            请按照以下格式输出：
            【核心主题】用一句话概括
            【关键要点】分点列出3-5个核心内容
            【详细总结】用一段话综合阐述（可选）`,
          },
        ],
        model,
        temperature: 0.3, // 降低随机性
        max_tokens: 500,
      });
      const timeUsed = Date.now() - startTime;
      // 获取token使用情况
      const tokenUsage = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      };
      return {
        summary: completion.choices[0].message.content,
        tokenUsage,
        timeUsed,
      };
    } catch (error) {
      console.error('总结文本时出错:', error);
      return {
        summary: '总结失败，请稍后再试。',
        tokenUsage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        timeUsed: 0,
      };
    }
  }
}
