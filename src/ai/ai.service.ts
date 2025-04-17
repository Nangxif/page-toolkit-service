import { Injectable } from '@nestjs/common';
import { PaymentStatus, UserInfo } from '../types';
import { AskModelDto } from './dto/ai.dto';
import OpenAI from 'openai';
import { aiModelMap, ResponseCode } from '../constants';
import { PaymentApplyService } from '../payment-apply/payment-apply.service';

@Injectable()
export class AIService {
  constructor(private readonly paymentApplyService: PaymentApplyService) {}
  async askModel(user: UserInfo, data: AskModelDto) {
    const tryUseTimes = await this.paymentApplyService.getTryUseTimes(user);

    const paymentApplyInfo =
      await this.paymentApplyService.getPaymentApplyInfo(user);

    if (
      tryUseTimes >= 10 &&
      paymentApplyInfo?.paymentStatus !== PaymentStatus.PASS
    ) {
      return {
        code: ResponseCode.ERROR,
        message: '您的账号已超过试用次数，请支付后继续使用',
        data: null,
      };
    }

    const {
      model,
      apiKey,
      content,
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
    } = data;

    const openai = new OpenAI({
      baseURL: aiModelMap[model].api,
      apiKey,
    });
    const { summary, tokenUsage, timeUsed } = await this.summarizeText({
      openai,
      model: aiModelMap[model].model,
      systemPrompt,
      userPrompt,
      text: content,
      temperature,
      maxTokens,
    });
    if (tryUseTimes < 10) {
      await this.paymentApplyService.updateTryUseTimes(user);
    }
    return {
      code: ResponseCode.SUCCESS,
      message: '成功总结内容',
      data: { summary, tokenUsage, timeUsed },
    };
  }

  // 文本总结函数
  async summarizeText(params: {
    openai: OpenAI;
    model: string;
    systemPrompt?: string;
    userPrompt?: string;
    text: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const {
      openai,
      model,
      systemPrompt,
      userPrompt,
      text,
      temperature,
      maxTokens,
    } = params;
    const finalUserPrompt =
      userPrompt?.replace(/\{\{text\}\}/, text) ||
      `请为以下页面内容生成专业摘要，要求重点突出、层次分明：
        ${text}
       请按照以下格式输出：
       【核心主题】用一句话概括
       【关键要点】分点列出3-5个核心内容
       【详细总结】用一段话综合阐述（可选）`;
    try {
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              systemPrompt ||
              `你是一个专业的智能文本总结助手，请根据以下要求处理用户提供的页面内容：
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
            content: finalUserPrompt,
          },
        ],
        model,
        temperature: temperature || 0.3, // 降低随机性
        max_tokens: maxTokens || 1000,
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
      console.error('总结文本时出错:', error?.message);
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
