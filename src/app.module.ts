import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AIModule } from './ai/ai.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './auth/github.strategy';
import { NormalStrategy } from './auth/normal.strategy';
import { PaymentApplyModule } from './payment-apply/payment-apply.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          readyLog: true,
          config: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),
    PassportModule,
    UserModule,
    PaymentApplyModule,
    AIModule,
  ],
  controllers: [],
  providers: [GithubStrategy, NormalStrategy],
})
export class AppModule {}
