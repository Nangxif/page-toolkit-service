import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AccountType, PaymentStatus, UserInfo } from '../types';
import { CacheKeyPrefix, ResponseCode } from '../constants';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UtilsService } from '../utils/utils.service';
import {
  PayApplyDto,
  UpdatePasswordDto,
  VerifyEmailCodeDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  private transporter: any;
  private readonly redis: Redis | null;
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async githubLogin(req, res) {
    if (!req.user) {
      return { code: ResponseCode.ERROR, message: '登录失败' };
    }

    const token = `Bearer ${this.jwtService.sign(
      {
        id: req.user.githubId,
        accountType: AccountType.GITHUB,
      },
      { expiresIn: this.configService.get('TOKEN_VALIDITY') },
    )}`;

    // 保存或更新用户信息
    const user = await this.userModel.findOne({
      _id: req.user.githubId,
    });
    if (user) {
      // 更新用户信息
      await this.userModel.updateOne(
        { _id: req.user.githubId },
        {
          email: req.user.email,
          avatar: req.user.picture,
          username: req.user.username,
          token,
        },
      );
    } else {
      // 创建新用户
      await this.userModel.create({
        _id: req.user.githubId,
        email: req.user.email,
        avatar: req.user.picture,
        username: req.user.username,
        accountType: AccountType.GITHUB,
        token,
      });
    }

    res.cookie('PAGE_TOOLKIT_TOKEN', token, {
      httpOnly: false,
      maxAge: Number(this.configService.get('TOKEN_VALIDITY')),
    });

    res.redirect('http://localhost:8000/UserInfo.html');
  }

  // 获取邮箱验证码
  async getEmailCode(email: string) {
    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 将验证码保存到redis中
    await this.redis!.set(email, code, 'EX', 60 * 5);
    // 配置收件人信息
    const receiver = {
      // 主题
      subject: 'PageQueryText',
      // 收件人 的邮箱 可以是其他邮箱 不一定是qq邮箱
      to: email,
      // 可以使用html标签
      html: `<p>欢迎使用PageQueryText，您的验证码是：${code}，有效期为5分钟</p>`,
    };

    // 发送邮件
    const result = await this.utilsService.sendEmail(
      receiver.to,
      receiver.subject,
      receiver.html,
    );
    if (!result) {
      return { code: ResponseCode.ERROR, message: '验证码发送失败' };
    }
    return { code: ResponseCode.SUCCESS, message: '验证码发送成功' };
  }

  // 验证邮箱验证码后登陆
  async verifyEmailCode(body: VerifyEmailCodeDto, res) {
    const { email, code } = body;
    const redisCode = await this.redis!.get(email);
    if (!redisCode) {
      return { code: ResponseCode.ERROR, message: '验证码已过期' };
    }
    if (redisCode !== code) {
      return { code: ResponseCode.ERROR, message: '验证码错误' };
    }
    await this.redis!.del(email);
    // 生成token
    const token = `Bearer ${this.jwtService.sign(
      {
        id: email,
        accountType: AccountType.EMAIL,
      },
      { expiresIn: this.configService.get('TOKEN_VALIDITY') },
    )}`;
    this.redis!.set(
      `${CacheKeyPrefix.USER_TOKEN}:${email}`,
      JSON.stringify({
        _id: email,
        email,
        token,
        accountType: AccountType.EMAIL,
      }),
      'EX',
      Number(this.configService.get('TOKEN_VALIDITY')),
    );
    res.cookie('PAGE_TOOLKIT_TOKEN', token, {
      httpOnly: false,
      maxAge: Number(this.configService.get('TOKEN_VALIDITY')),
    });
    // 有就更新，没有就创建
    const user = await this.userModel.findOne({ _id: email });
    if (!user) {
      await this.userModel.create({
        _id: email,
        email,
        token,
        accountType: AccountType.EMAIL,
      });
    } else {
      await this.userModel.updateOne(
        { _id: email },
        { email, token, accountType: AccountType.EMAIL },
      );
    }
    res.send({
      code: ResponseCode.SUCCESS,
      message: '登录成功',
      data: {
        token,
      },
    });
  }

  async updatePassword(user: UserInfo, body: UpdatePasswordDto) {
    await this.userModel.updateOne({ _id: user._id }, body);
    return {
      code: ResponseCode.SUCCESS,
      message: '密码设置成功',
      data: true,
    };
  }

  async validateToken({ id, token }): Promise<boolean> {
    // 先检查 Redis
    const cache_user = await this.redis!.get(
      `${CacheKeyPrefix.USER_TOKEN}:${id}`,
    );
    if (cache_user) {
      return JSON.parse(cache_user).token === token;
    }
    // 回退到数据库检查
    const user = await this.userModel.findById(id);
    return !!user && user.token === token;
  }

  async getUserInfoById(id: string) {
    const user = await this.redis!.get(`${CacheKeyPrefix.USER_TOKEN}:${id}`);
    if (user) {
      return JSON.parse(user);
    }
    return await this.userModel.findById(id);
  }

  async payApply(user: UserInfo, body: PayApplyDto) {
    const userInfo = await this.userModel.findById(user._id);
    if (userInfo?.paymentStatus === PaymentStatus.REVIEWED) {
      return {
        code: ResponseCode.ERROR,
        message: '您已具备Page Toolkit所有工具的使用权利，无需重复支付',
        data: false,
      };
    }
    await this.userModel.updateOne(
      { _id: user._id },
      { ...body, paymentStatus: PaymentStatus.PAID_PENDING_REVIEW },
    );
    return {
      code: ResponseCode.SUCCESS,
      message: '支付申请成功',
      data: true,
    };
  }

  async getPayApplyInfo(user: UserInfo) {
    const userInfo = await this.userModel.findById(user._id);

    return {
      code: ResponseCode.SUCCESS,
      message: '获取成功',
      data: {
        paymentWay: userInfo?.paymentWay,
        serialNumber: userInfo?.serialNumber,
        paymentStatus: userInfo?.paymentStatus,
      },
    };
  }
}
