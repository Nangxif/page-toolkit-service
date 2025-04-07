import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AccountType } from '../types';
import { CacheKeyPrefix, ResponseCode } from '../constants';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UtilsService } from '../utils/utils.service';

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
    console.log('req.user=', req.user);
    if (!req.user) {
      return { code: ResponseCode.ERROR, message: '登录失败' };
    }
    // 保存或更新用户信息
    const existingUser = await this.userModel.findOne({
      _id: req.user.githubId,
    });

    let user;
    if (existingUser) {
      // 更新用户信息
      user = existingUser;
    } else {
      // 创建新用户
      user = await this.userModel.create({
        _id: req.user.githubId,
        email: req.user.email,
        avatar: req.user.picture,
        account_type: AccountType.GITHUB,
      });
    }

    const token = this.jwtService.sign(
      {
        id: req.user.githubId,
        account_type: AccountType.GITHUB,
      },
      { expiresIn: this.configService.get('TOKEN_VALIDITY') },
    );

    // 方式1: 将 token 设置在 cookie 中
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: Number(this.configService.get('TOKEN_VALIDITY')), // 1天
    });

    return {
      code: ResponseCode.SUCCESS,
      message: '登录成功',
      data: {
        token,
      },
    };
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
  async verifyEmailCode(email: string, code: string) {
    const redisCode = await this.redis!.get(email);
    if (!redisCode) {
      return { code: ResponseCode.ERROR, message: '验证码已过期' };
    }
    if (redisCode !== code) {
      return { code: ResponseCode.ERROR, message: '验证码错误' };
    }
    await this.redis!.del(email);
    // 生成token
    const token = this.jwtService.sign(
      {
        id: email,
        account_type: AccountType.EMAIL,
      },
      { expiresIn: this.configService.get('TOKEN_VALIDITY') },
    );
    this.redis!.set(
      `${CacheKeyPrefix.USER_TOKEN}:${email}`,
      JSON.stringify({
        _id: email,
        email,
        token,
        account_type: AccountType.EMAIL,
      }),
      'EX',
      Number(this.configService.get('TOKEN_VALIDITY')),
    );

    // 有就更新，没有就创建
    const user = await this.userModel.findOne({ _id: email });
    if (!user) {
      await this.userModel.create({
        _id: email,
        email,
        token,
        account_type: AccountType.EMAIL,
      });
    } else {
      await this.userModel.updateOne(
        { _id: email },
        { email, token, account_type: AccountType.EMAIL },
      );
    }
    return {
      code: ResponseCode.SUCCESS,
      message: '登录成功',
      data: {
        token,
      },
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
}
