const { OpenAI } = require("openai");
const Bottleneck = require("bottleneck");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const limiter = new Bottleneck({
  minTime: 1500, // mỗi 1.5s mới cho phép gọi tiếp
  maxConcurrent: 1, // chỉ 1 request GPT tại 1 thời điểm
});

module.exports = {
  chat: {
    completions: {
      create: limiter.wrap(openai.chat.completions.create.bind(openai.chat.completions))
    }
  }
};
