import { Injectable } from '@nestjs/common';
const nodemailer = require('nodemailer');

@Injectable()
export class UtilsService {
  private transporter: any;
  constructor() {
    //创建一个SMTP客户端配置对象
    this.transporter = nodemailer.createTransport({
      // 默认支持的邮箱服务包括：”QQ”、”163”、”126”、”iCloud”、”Hotmail”、”Yahoo”等
      service: 'QQ',
      auth: {
        // 发件人邮箱账号
        user: '2454753441@qq.com',
        //发件人邮箱的授权码 需要在自己的邮箱设置中生成,并不是邮件的登录密码
        pass: 'ppaaztctyvrbdiee',
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: `"PageQueryText"<2454753441@qq.com>`,
        to,
        subject,
        text,
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
