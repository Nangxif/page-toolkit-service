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
  [ModelType.Gpt_3_5_Turbo]: {
    api: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
  },
  [ModelType.Moonshot_V1_8k]: {
    api: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
};
