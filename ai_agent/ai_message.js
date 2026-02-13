/**
 * AI 消息模块：根据问题调用本地 AI API 并返回回复
 * 使用 OpenAI 兼容接口（/v1/chat/completions）
 */

/** @type {string} API 基础地址 */
const BASE_URL = "http://127.0.0.1:8045/v1";

/** @type {string} API 密钥 */
const API_KEY = "sk-f9e9a93c217043b58f5798f4928e097f";

/** @type {string} 使用的模型名称 */
const MODEL = "claude-opus-4-5-thinking";

/**
 * 向 AI API 发送问题并获取回复
 * @param {string} question - 用户问题或消息内容
 * @param {Object} [options] - 可选参数
 * @param {number} [options.maxTokens=2048] - 最大生成 token 数
 * @param {number} [options.temperature=0.7] - 采样温度 (0-2)
 * @param {Array<{role: string, content: string}>} [options.messages] - 自定义对话历史，不传则仅用当前 question 作为 user 消息
 * @returns {Promise<string>} AI 回复的文本内容
 * @throws {Error} 当请求失败或 API 返回错误时
 */
async function sendToAI(question, options = {}) {
  const {
    maxTokens = 2048,
    temperature = 0.7,
    messages: customMessages,
  } = options;

  const messages = Array.isArray(customMessages) && customMessages.length > 0
    ? customMessages
    : [{ role: "user", content: question }];

  const body = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  const url = `${BASE_URL.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI API 请求失败: ${res.status} ${res.statusText}\n${text}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  const content = data.choices?.[0]?.message?.content;
  if (content == null) {
    throw new Error("API 返回中缺少回复内容");
  }

  return typeof content === "string" ? content : String(content);
}

/**
 * 获取当前配置（不暴露密钥时可做只读或脱敏）
 * @returns {{ baseUrl: string, model: string }}
 */
function getConfig() {
  return {
    baseUrl: BASE_URL,
    model: MODEL,
  };
}

export { sendToAI, getConfig, BASE_URL, API_KEY, MODEL };
