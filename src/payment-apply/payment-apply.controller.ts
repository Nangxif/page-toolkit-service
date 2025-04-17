import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayApplyDto } from './dto/payment-apply.dto';
import { PaymentApplyService } from './payment-apply.service';
import { ResponseCode } from '../constants';

@Controller('api')
export class PaymentApplyController {
  constructor(private readonly paymentApplyService: PaymentApplyService) {}

  // 支付申请
  @Post('payment/apply')
  @UseGuards(AuthGuard(['normal']))
  async payApply(@Req() req, @Body() body: PayApplyDto) {
    return await this.paymentApplyService.paymentApply(req.user, body);
  }

  // 获取支付信息
  @Get('payment/apply/info')
  @UseGuards(AuthGuard(['normal']))
  async getPayApplyInfo(@Req() req) {
    const paymentApplyInfo = await this.paymentApplyService.getPaymentApplyInfo(
      req.user,
    );
    return {
      code: ResponseCode.SUCCESS,
      message: '获取成功',
      data: paymentApplyInfo,
    };
  }

  // 获取剩余试用次数
  @Get('/remaining-times')
  @UseGuards(AuthGuard(['normal']))
  async getRemainingTryUseTimes(@Req() req) {
    const remainingTryUseTimes =
      await this.paymentApplyService.getRemainingTryUseTimes(req.user);
    return {
      code: ResponseCode.SUCCESS,
      message: '获取成功',
      data: remainingTryUseTimes,
    };
  }
}
