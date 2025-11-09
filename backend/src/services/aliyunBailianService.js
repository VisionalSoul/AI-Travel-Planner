// 使用OpenAI客户端库替代axios
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AliyunBailianService {
   constructor() {
    // 使用官方示例中的正确环境变量名称
    this.apiKey = process.env.DASHSCOPE_API_KEY;
    // 确保endpoint格式正确，移除多余的空格和引号
    const envEndpoint = process.env.DASHSCOPE_BASE_URL;
    // 清理环境变量中的引号和多余空格
    const cleanEndpoint = envEndpoint ? envEndpoint.trim().replace(/^["'`]|["'`]$/g, '') : '';
    
    // 根据官方示例，使用compatible-mode/v1路径格式
    const baseUrl = cleanEndpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    
    try {
      // 验证构建的URL
      if (!this.validateUrl(baseUrl)) {
        throw new Error(`构建的URL格式无效: ${baseUrl}`);
      }
      
      // 初始化OpenAI客户端
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        baseURL: baseUrl,
        defaultHeaders: {
          'Content-Type': 'application/json'
        },
        timeout: 600000 // 60秒超时
      });
      
      console.log('成功初始化OpenAI客户端（使用compatible-mode格式）');
    } catch (error) {
      console.error('初始化OpenAI客户端时出错:', error.message);
      // 记录必要信息以便后续诊断
      this.openai = null;
    }
    
    this.apiVersion = process.env.ALIYUN_BAILIAN_API_VERSION || '2024-01-01';
    
    console.log('阿里云百炼服务初始化 (OpenAI客户端):', {
      hasApiKey: !!this.apiKey,
      hasOpenAIClient: !!this.openai,
      baseUrl: baseUrl,
      urlFormat: 'compatible-mode/v1'
    });
  }

  // 注意：OpenAI兼容模式不需要生成签名，直接使用Bearer token认证
  // 已移除generateSignature方法

  /**
   * 生成旅行计划
   */
  // 增强的URL验证辅助方法
  validateUrl(url) {
    try {
      // 检查URL是否为空或无效
      if (!url || typeof url !== 'string') {
        console.error('URL验证失败: 无效的URL输入', { urlType: typeof url, urlLength: url ? url.length : 0 });
        return false;
      }
      
      // 移除可能的多余空格
      const trimmedUrl = url.trim();
      
      // 创建URL对象进行验证
      const urlObj = new URL(trimmedUrl);
      
      // 验证必要的URL组件
      if (!urlObj.protocol || !urlObj.hostname) {
        console.error('URL验证失败: 缺少必要的URL组件', { protocol: urlObj.protocol, hostname: urlObj.hostname });
        return false;
      }
      
      // 验证协议是否为HTTPS
      if (urlObj.protocol !== 'https:') {
        console.warn('URL警告: 推荐使用HTTPS协议', { protocol: urlObj.protocol });
      }
      
      console.log('URL格式验证通过:', { url: trimmedUrl, protocol: urlObj.protocol, hostname: urlObj.hostname, pathname: urlObj.pathname });
      return true;
    } catch (error) {
      console.error('URL格式验证失败:', { url, error: error.message, urlLength: url.length, firstChars: url.substring(0, 50) + '...' });
      return false;
    }
  }
  
  // 增强的URL构建验证
  buildAndValidateUrl(baseUrl, path) {
    // 确保基础URL不以斜杠结尾
    const normalizedBase = baseUrl.replace(/\/$/, '');
    // 确保路径不以斜杠开头
    const normalizedPath = path.replace(/^\//, '');
    // 构建完整URL
    const fullUrl = `${normalizedBase}/${normalizedPath}`;
    
    // 验证构建的URL
    if (!this.validateUrl(fullUrl)) {
      throw new Error(`构建的URL格式无效: ${fullUrl}`);
    }
    
    return fullUrl;
  }

  /**
   * 直接调用OpenAI客户端API的方法
   */
  async makeOpenAIRequest(requestData, apiKey = null) {
    try {
      // 优先使用传入的apiKey，如果没有则使用环境变量中的
      const actualApiKey = apiKey || this.apiKey;
      
      // 检查OpenAI客户端是否初始化成功
      if (!this.openai) {
        throw new Error('OpenAI客户端未初始化');
      }
      
      if (!actualApiKey) {
        console.error('错误: 阿里云百炼API密钥未配置');
        throw new Error('阿里云百炼API密钥未配置');
      }

      // 记录请求信息（不记录敏感信息）
      console.log('准备发送API请求 (OpenAI客户端):', {
        model: requestData.model,
        requestFormat: 'OpenAI标准格式',
        messageCount: requestData.messages?.length || 0
      });
      
      // 创建一个临时的OpenAI客户端实例，以便支持API密钥覆盖
      let client = this.openai;
      if (apiKey) {
        // 如果传入了不同的API密钥，创建一个新的客户端实例
        client = new OpenAI({
          apiKey: actualApiKey,
          baseURL: this.openai.baseURL,
          timeout: 600000 // 60秒超时
        });
      }
      
      // 添加重试机制的内部函数
      const makeRequestWithRetry = async (retryCount = 0) => {
        const maxRetries = 3;
        const isRetry = retryCount > 0;
        
        if (isRetry) {
          console.log(`API请求重试 ${retryCount}/${maxRetries}:`, {
            model: requestData.model,
            requestType: 'chat.completions'
          });
        }
        
        try {
          // 使用OpenAI客户端进行API调用
          const response = await client.chat.completions.create(requestData, {
            timeout: 600000 // 增加超时时间到60秒
          });
          
          if (isRetry) {
            console.log(`API请求重试成功 (第${retryCount}次重试)`);
          }
          
          return response;
        } catch (error) {
            // 判断是否应该重试
            const shouldRetry = retryCount < maxRetries && 
              (error.code === 'ECONNABORTED' || // 超时
               error.code === 'ECONNREFUSED' || // 连接被拒绝
               error.code === 'ENOTFOUND' ||    // 域名未找到
               (error.status >= 500 || (error.error && error.error.status >= 500))); // 服务器错误
            
            if (shouldRetry) {
              // 计算指数退避时间
              const baseDelay = 1000;
              const jitter = Math.random() * 1000;
              const delay = Math.min(baseDelay * Math.pow(2, retryCount) + jitter, 10000);
              
              console.log(`API请求将在 ${delay.toFixed(0)}ms 后重试 (第${retryCount + 1}/${maxRetries}次)`, {
                errorType: error.code || 'API_' + (error.status || (error.error?.status || 'UNKNOWN')),
                errorMessage: error.message || (error.error?.message || '未知错误'),
                requestType: 'chat.completions'
              });
            
              // 等待延迟时间
              await new Promise(resolve => setTimeout(resolve, delay));
              
              // 递归调用进行重试
              return makeRequestWithRetry(retryCount + 1);
            }
            
            // 如果不应该重试，直接抛出错误
            throw error;
        }
      };
      
      // 执行带重试的请求
      const response = await makeRequestWithRetry();

      console.log('API响应成功接收');
      
      // 统一错误处理
      if (response.error) {
        // 提取错误信息
        let errorCode = response.error.status || 500;
        let errorMsg = response.error.message || 'API返回错误';
        
        // 根据错误码提供更有用的提示
        switch(response.error.code) {
          case 'invalid_request_error':
            errorMsg = `参数错误: ${errorMsg}。请检查API请求参数。`;
            break;
          case 'authentication_error':
            errorMsg = `认证错误: ${errorMsg}。请检查API密钥是否正确。`;
            break;
          case 'rate_limit_error':
            errorMsg = `请求频率超限: ${errorMsg}。请稍后重试。`;
            break;
          default:
            break;
        }
        
        return {
          success: false,
          error: {
            code: errorCode,
            message: errorMsg
          }
        };
      }

      // 获取核心数据
      const rawContent = response.choices?.[0]?.message?.content || response;
      const finishReason = response.choices?.[0]?.finish_reason;
      
      // 尝试将JSON字符串解析为JavaScript对象
      let coreData = rawContent;
      if (typeof rawContent === 'string') {
        try {
          // 处理可能的JSON字符串响应
          coreData = JSON.parse(rawContent);
          console.log('成功将API响应解析为JSON对象');
        } catch (parseError) {
          // 处理被截断的JSON
          console.warn('API响应解析失败:', parseError.message);
          console.warn('完成原因:', finishReason);
          
          // 如果是因为长度被截断，尝试修复JSON
          if (finishReason === 'length') {
            console.warn('警告: API响应因长度限制被截断，尝试修复不完整的JSON...');
            try {
              // 尝试简单修复：添加缺失的闭合括号和引号
              let repairedContent = rawContent;
              
              // 计算括号和引号的数量
              const openBrackets = (repairedContent.match(/\{/g) || []).length;
              const closeBrackets = (repairedContent.match(/\}/g) || []).length;
              const openBrackets2 = (repairedContent.match(/\[/g) || []).length;
              const closeBrackets2 = (repairedContent.match(/\]/g) || []).length;
              const openQuotes = (repairedContent.match(/"/g) || []).length;
              
              // 添加缺失的闭合括号
              for (let i = closeBrackets; i < openBrackets; i++) {
                repairedContent += '}';
              }
              for (let i = closeBrackets2; i < openBrackets2; i++) {
                repairedContent += ']';
              }
              
              // 如果引号数量为奇数，添加一个闭合引号
              if (openQuotes % 2 !== 0) {
                repairedContent += '"';
              }
              
              // 尝试解析修复后的JSON
              coreData = JSON.parse(repairedContent);
              console.log('成功修复并解析被截断的JSON');
            } catch (repairError) {
              console.error('JSON修复失败:', repairError.message);
              // 如果修复失败，仍然返回原始内容，但标记为可能不完整
              console.warn('返回原始字符串内容，但请注意它可能不完整');
            }
          } else {
            // 如果不是因为长度被截断，保留原始字符串
            console.warn('返回原始字符串内容');
          }
        }
      }
      
      // 标准化返回格式
      return {
        success: true,
        data: coreData,
        fullResponse: response,
        statusCode: 200
      };
    } catch (error) {
      // 捕获所有其他异常
      console.error('API调用异常:', error);
      
      // 提取错误详情
      let errorType = 'UNKNOWN_ERROR';
      let errorMessage = error.message || '发生未知错误';
      let errorStatus = error.status || 500;
      
      if (error.code) {
        errorType = `API_${error.code.toUpperCase()}`;
      } else if (error.status) {
        errorType = `HTTP_${error.status}`;
      }
      
      // 标准化错误响应格式
      return {
        success: false,
        error: {
          type: errorType,
          message: errorMessage,
          status: errorStatus
        }
      };
    }
  }
  
  /**
   * 生成旅行计划
   */
  async generateTravelPlan(prompt, model = 'qwen-plus-0723', apiKey = null) {
    try {
      // 优先使用传入的apiKey，如果没有则使用环境变量中的
      const actualApiKey = apiKey || this.apiKey;
      
      // 预处理提示词，确保其简洁有效
      const processedPrompt = prompt.trim().substring(0, 10000); // 限制提示词长度
      
      // 构建请求数据
      const requestData = {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是专业旅行规划师，请严格按照JSON格式返回旅行行程和预算分析结果。'
          },
          {
            role: 'user',
            content: processedPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000, // 增加token数量以避免响应被截断
        response_format: { type: 'json_object' },
        stream: false
      };
      
      // 调用通用的API请求方法
      return await this.makeOpenAIRequest(requestData, actualApiKey);
    } catch (error) {
      // 捕获所有异常
      console.error('生成旅行计划时异常:', error);
      return {
        success: false,
        error: {
          type: 'PROCESSING_ERROR',
          message: `生成旅行计划失败: ${error.message}`,
          status: 500
        }
      };
    }
  }

  /**
   * 处理用户的旅行相关问题
   */
  async handleTravelQuery(query, context = '') {
    try {
      console.log('开始处理旅行查询:', {
        hasQuery: !!query,
        hasContext: !!context,
        queryLength: query ? query.length : 0,
        contextLength: context ? context.length : 0
      });
      
      const prompt = context 
        ? `${context}\n\n用户新问题: ${query}`
        : `请作为旅行顾问回答以下问题:\n${query}`;

      // 构建符合OpenAI API的请求参数
      const requestData = {
        model: 'qwen-plus-0723', // 使用指定的模型
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行规划助手。请根据用户的需求，提供详细、实用的旅行建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000, // 增加token数量以避免响应被截断
      };

      // 直接调用OpenAI客户端而不是递归调用自身
      const result = await this.makeOpenAIRequest(requestData);
      console.log('旅行查询处理完成:', { success: result.success });
      return result;
    } catch (error) {
      console.error('旅行查询处理失败:', error.message);
      return {
        success: false,
        error: {
          type: 'PROCESSING_ERROR',
          message: `处理旅行查询时出错: ${error.message}`,
          status: 500
        }
      };
    }
  }

  /**
   * 推荐旅行目的地
   * @param {Object} preferences - 用户偏好，包含季节、预算、兴趣等
   * @returns {Promise<Object>} - 返回推荐结果
   */
  async recommendDestinations(preferences) {
    try {
      // 验证输入参数
      if (!preferences || typeof preferences !== 'object') {
        throw new Error('无效的偏好数据');
      }
      
      // 构建符合OpenAI API的请求参数
      const requestData = {
        model: 'qwen-plus-0723',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行目的地推荐专家。请根据用户的偏好和需求，推荐合适的旅行目的地。'
          },
          {
            role: 'user',
            content: `基于以下旅行偏好，推荐3-5个适合的旅游目的地，并简要说明推荐理由：\n` +
              `- 旅行类型: ${preferences?.travelType?.join(', ') || '不限'}\n` +
              `- 预算范围: ${preferences?.budget || '不限'}\n` +
              `- 时长: ${preferences?.duration || '不限'}\n` +
              `- 季节: ${preferences?.season || '不限'}\n` +
              `- 兴趣点: ${preferences?.interests?.join(', ') || '无特殊兴趣'}\n` +
              `- 其他偏好: ${preferences?.other || '无'}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000, // 增加token数量以避免响应被截断
      };
      
      // 直接调用OpenAI客户端而不是递归调用自身
      const result = await this.makeOpenAIRequest(requestData);
      
      // 如果调用成功，进一步处理结果
      if (result.success) {
        // 可以在这里添加额外的数据处理逻辑
        return result;
      } else {
        // 处理API调用失败的情况
        console.error('目的地推荐请求失败:', result.error);
        throw new Error(`API调用失败: ${result.error.message}`);
      }
    } catch (error) {
      console.error('处理目的地推荐时发生错误:', error);
      return {
        success: false,
        error: {
          type: 'PROCESSING_ERROR',
          message: `处理旅行偏好推荐时出错: ${error.message}`,
          status: 500
        }
      };
    }
  }
}

module.exports = AliyunBailianService;