// 账号类型
export enum AccountType {
  EMAIL = 'email',
  GITHUB = 'github',
  PASSWORD = 'password',
}

export enum PaymentWay {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}

export enum PaymentStatus {
  /** 未支付 */
  NO_PAY = 'NO_PAY',
  /** 已支付待审核 */
  PAID_PENDING_REVIEW = 'PAID_PENDING_REVIEW',
  /** 已审核 */
  REVIEWED = 'REVIEWED',
}

export type UserInfo = {
  _id: string;
  email: string;
  accountType: AccountType;
};
