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
import {
  GetEmailCodeDto,
  PasswordLoginDto,
  UpdatePasswordDto,
  UpdateUserInfoDto,
  VerifyEmailCodeDto,
} from './dto/user.dto';
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

  @Post('auth/password/login')
  async passwordLogin(@Body() body: PasswordLoginDto, @Res() res) {
    this.userService.passwordLogin(body, res);
  }

  @Post('auth/logout')
  @UseGuards(AuthGuard(['normal']))
  async logout(@Req() req) {
    await this.userService.logout(req.user);
    return {
      code: ResponseCode.SUCCESS,
      message: '退出成功',
      data: true,
    };
  }

  @Post('user/update/password')
  @UseGuards(AuthGuard(['normal']))
  async updatePassword(@Req() req, @Body() body: UpdatePasswordDto) {
    return this.userService.updatePassword(req.user, body);
  }

  // 获取用户信息
  @Get('user/info')
  @UseGuards(AuthGuard(['normal']))
  async getUserInfo(@Req() req) {
    const user = await this.userService.getUserInfo(req.user);
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

  @Post('user/info/update')
  @UseGuards(AuthGuard(['normal']))
  async updateUserInfo(@Req() req, @Body() body: UpdateUserInfoDto) {
    return await this.userService.updateUserInfo(req.user, body);
  }
}
