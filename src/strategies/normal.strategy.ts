import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class NormalStrategy extends PassportStrategy(Strategy, 'normal') {
  private readonly redis: Redis | null;
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
    this.redis = this.redisService.getOrThrow();
  }

  async validate(payload) {
    try {
      // 是否过期
      const isExpired = await this.redis!.get(payload.id);
      if (isExpired) {
        throw new UnauthorizedException('令牌已失效，请重新登录');
      }
      const user = await this.userService.getUserInfoById(payload.id);
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
