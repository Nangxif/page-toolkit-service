import { Injectable } from '@nestjs/common';
import { PaymentStatus, UserInfo } from '../types';
import { ResponseCode } from '../constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PayApplyDto } from './dto/payment-apply.dto';
import {
  PaymentApply,
  PaymentApplyDocument,
} from './schemas/payment-apply.schema';
import {
  TryUseTimes,
  TryUseTimesDocument,
} from './schemas/try-use-times.schema';
@Injectable()
export class PaymentApplyService {
  constructor(
    @InjectModel(PaymentApply.name)
    private paymentApplyModel: Model<PaymentApplyDocument>,
    @InjectModel(TryUseTimes.name)
    private tryUseTimesModel: Model<TryUseTimesDocument>,
  ) {}

  async paymentApply(user: UserInfo, body: PayApplyDto) {
    const paymentApplyInfo = await this.paymentApplyModel.findOne({
      _id: user._id,
    });
    if (paymentApplyInfo?.paymentStatus === PaymentStatus.PASS) {
      return {
        code: ResponseCode.ERROR,
        message: '您已具备Page Toolkit所有工具的使用权利，无需重复支付',
        data: false,
      };
    }
    if (!paymentApplyInfo) {
      await this.paymentApplyModel.create({
        _id: user._id,
        ...body,
        paymentStatus: PaymentStatus.PAID_PENDING_REVIEW,
      });
    } else {
      await this.paymentApplyModel.updateOne(
        { _id: user._id },
        { ...body, paymentStatus: PaymentStatus.PAID_PENDING_REVIEW },
      );
    }
    return {
      code: ResponseCode.SUCCESS,
      message: '支付申请成功',
      data: true,
    };
  }

  async getPaymentApplyInfo(user: UserInfo) {
    return await this.paymentApplyModel.findOne({
      _id: user._id,
    });
  }

  async getTryUseTimes(user: UserInfo) {
    const tryUseTimes = await this.tryUseTimesModel.findOne({
      _id: user._id,
    });
    if (!tryUseTimes) {
      return 0;
    }
    return tryUseTimes.times;
  }

  async createTryUseTimes(id: string) {
    await this.tryUseTimesModel.create({
      _id: id,
      times: 0,
    });
  }

  async updateTryUseTimes(user: UserInfo) {
    await this.tryUseTimesModel.updateOne(
      { _id: user._id },
      { $inc: { times: 1 } },
    );
  }

  async getRemainingTryUseTimes(user: UserInfo) {
    const tryUseTimes = await this.tryUseTimesModel.findOne({
      _id: user._id,
    });
    console.log(tryUseTimes);
    if (!tryUseTimes) {
      return 10;
    }
    return 10 - tryUseTimes.times;
  }
}
