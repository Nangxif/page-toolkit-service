import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetEmailCodeDto, VerifyEmailCodeDto } from './dto/user.dto';
import { ResponseCode } from '../constants';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('auth/github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // GitHub 登录重定向处理
  }

  @Get('auth/github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthRedirect(@Req() req, @Res() res) {
    return this.userService.githubLogin(req, res);
  }

  @Post('auth/email/code')
  async getEmailCode(@Body() body: GetEmailCodeDto) {
    return this.userService.getEmailCode(body.email);
  }

  @Post('auth/email/verify')
  async verifyEmailCode(@Body() body: VerifyEmailCodeDto, @Res() res) {
    this.userService.verifyEmailCode(body, res);
  }

  // 获取用户信息
  @Get('user/info')
  @UseGuards(AuthGuard(['email']))
  async getUserInfo(@Req() req) {
    const user = await this.userService.getUserInfoById(req.user._id);
    if (!user) {
      return {
        code: ResponseCode.ERROR,
        message: '用户不存在',
      };
    }
    return {
      code: ResponseCode.SUCCESS,
      message: '获取用户信息成功',
      data: {
        email: user.email,
        avatar: user.avatar,
        username: user.username,
        accountType: user.accountType,
      },
    };
  }
}
