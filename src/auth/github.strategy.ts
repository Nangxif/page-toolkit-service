import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email'],
      proxy: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { id, displayName, username, photos, emails } = profile;

    const user = {
      githubId: id,
      displayName: displayName,
      username: username,
      picture: photos && photos.length > 0 ? photos[0].value : null,
      email: emails && emails.length > 0 ? emails[0].value : null,
      accessToken,
    };

    done(null, user);
  }
}
