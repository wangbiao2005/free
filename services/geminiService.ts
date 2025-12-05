// DEEPSEEK API SERVICE
// 注意：DeepSeek 目前主要提供强大的文本生成模型 (deepseek-chat/deepseek-reasoner)。
// 它暂不支持原生图片识别 (Vision) 和 语音合成 (TTS)。

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODEL_NAME = "deepseek-chat"; // DeepSeek V3

// Helper: 获取 API Key
const getApiKey = () => {
  const localKey = localStorage.getItem('deepseek_api_key');
  return localKey || process.env.API_KEY || '';
};

// Helper: 通用 DeepSeek 请求函数
const callDeepSeek = async (messages: any[], jsonMode: boolean = false) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key 缺失。请在设置中配置您的 DeepSeek API Key。");
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        stream: false,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 1.3 // DeepSeek 建议 V3 使用较高的 temperature 以获得更生动的回复
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `DeepSeek API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("DeepSeek Call Error:", error);
    throw error;
  }
};

/**
 * 视频摘要生成
 */
export const generateVideoSummary = async (videoTitle: string, userNotes: string): Promise<string> => {
  const prompt = `
    你是一位专业的视频编辑和内容策略专家。
    请根据以下详情生成一段简洁吸引人的中文摘要，并生成3个具有病毒传播潜力的标签：
    
    视频标题: ${videoTitle}
    用户备注/背景: ${userNotes}
    
    输出格式要求:
    **摘要：** [此处填写摘要内容]
    **精彩看点：** 
    - [看点 1]
    - [看点 2]
    **推荐标签：** #标签1 #标签2 #标签3
  `;

  return await callDeepSeek([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt }
  ]);
};

/**
 * FFmpeg 命令生成
 */
export const getFFmpegCommand = async (operation: string, fileType: string): Promise<string> => {
  try {
    const content = await callDeepSeek([
      { role: "system", content: "You are an expert in FFmpeg." },
      { role: "user", content: `Write a raw FFmpeg command line string to perform: "${operation}" on a "${fileType}" file. Return ONLY the command, no markdown, no explanations.` }
    ]);
    return content.trim();
  } catch (e) {
    return "ffmpeg -i input.mp4 output.mp4"; // Failover
  }
}

/**
 * 文本转语音 (TTS)
 * 注意：DeepSeek API 暂不支持 TTS。此函数将抛出错误提示用户。
 */
export const generateTextToSpeech = async (text: string, voiceName: string = 'Zephyr'): Promise<string> => {
  // DeepSeek 不支持音频生成。
  // 为了不破坏应用流程，我们抛出一个明确的错误，或者在未来集成其他 TTS 服务。
  throw new Error("DeepSeek API 当前暂不支持语音合成 (TTS) 功能。请等待未来更新或切换其他服务。");
}

export type TextAction = 'summarize' | 'translate_en' | 'translate_zh' | 'polish' | 'fix_grammar';

/**
 * AI 文本处理
 */
export const processTextWithAI = async (text: string, action: TextAction): Promise<string> => {
  let systemPrompt = "You are a helpful assistant.";
  let userPrompt = "";

  switch (action) {
    case 'summarize':
      userPrompt = "请对以下文本进行简明扼要的摘要（中文输出）：\n\n" + text;
      break;
    case 'translate_en':
      userPrompt = "Please translate the following text into professional English:\n\n" + text;
      break;
    case 'translate_zh':
      userPrompt = "请将以下文本翻译成流畅、地道的中文：\n\n" + text;
      break;
    case 'polish':
      userPrompt = "请润色以下文本，使其语气更专业、表达更流畅（保持原语言）：\n\n" + text;
      break;
    case 'fix_grammar':
      userPrompt = "请检查并修复以下文本的语法错误，并列出修改要点：\n\n" + text;
      break;
  }

  return await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]);
};

/**
 * 图片分析 (Vision)
 * 注意：DeepSeek API 暂不支持 Vision。此函数将抛出错误。
 */
export const analyzeImageWithAI = async (base64Image: string, mimeType: string, promptText: string): Promise<string> => {
   // DeepSeek V3 是纯文本模型。
   throw new Error("DeepSeek API 当前暂不支持图片识别 (Vision) 功能。");
};

/**
 * 正则表达式生成
 */
export const generateRegexWithAI = async (description: string): Promise<any> => {
  const prompt = `
    作为一名正则表达式专家，请根据以下需求生成一个正则表达式。
    需求：${description}
    
    请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记，只返回纯 JSON 字符串）：
    {
      "regex": "生成的正则表达式字符串",
      "flags": "修饰符 (如 g, i, m)",
      "explanation": "简短的中文解释，说明该正则匹配什么"
    }
  `;
    
  try {
    const content = await callDeepSeek([
      { role: "system", content: "You are a regex expert. You output JSON only." },
      { role: "user", content: prompt }
    ], true); // Enable JSON mode
    
    return JSON.parse(content || "{}");
  } catch (e) {
    console.error("Regex Gen Error:", e);
    throw e;
  }
}

/**
 * AI 智能助手 (生活百宝箱)
 */
export const askAIAssistant = async (query: string): Promise<string> => {
  return await callDeepSeek([
    { role: "system", content: "你是一个智能生活助手和百科全书。请简洁、准确地回答用户的以下问题。如果是数学计算、汇率转换或单位换算，请给出计算过程和结果。" },
    { role: "user", content: query }
  ]);
}

/**
 * 音频处理建议
 */
export const getAudioProcessingAdvice = async (task: string, fileInfo: string): Promise<string> => {
  return await callDeepSeek([
    { role: "system", content: "你是一个专业音频工程师。" },
    { role: "user", content: `针对"${task}"任务，对音频"${fileInfo}"给出3条简短的参数设置建议（例如采样率、降噪阈值、EQ设置等）。直接列出建议，无需废话。` }
  ]);
}
