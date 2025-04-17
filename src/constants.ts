import { ModelType } from './types';

export const ResponseCode = {
  SUCCESS: 200,
  ERROR: 500,
};

export const CacheKeyPrefix = {
  USER_TOKEN: 'page_toolkit_user_token',
};

export const aiModelMap = {
  [ModelType.Deepseek_Chat]: {
    api: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  [ModelType.Moonshot_V1_8k]: {
    api: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },

  [ModelType.Moonshot_V1_32k]: {
    api: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-32k',
  },
};
