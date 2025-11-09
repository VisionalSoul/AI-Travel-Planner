// 测试OpenAI客户端API调用功能
const AliyunBailianService = require('./src/services/aliyunBailianService');
require('dotenv').config();

/**
 * 测试函数：测试旅行查询功能
 */
async function testTravelQuery() {
  console.log('=== 测试旅行查询功能 ===');
  
  const service = new AliyunBailianService();
  
  // 模拟测试 - 代码结构验证
  if (global.SKIP_ACTUAL_API_CALLS) {
    console.log('进行代码结构验证...');
    
    // 验证对象创建成功
    if (!service) {
      console.error('服务实例创建失败');
      return false;
    }
    
    // 验证方法存在
    if (typeof service.handleTravelQuery !== 'function') {
      console.error('handleTravelQuery方法不存在');
      return false;
    }
    
    // 验证generateTravelPlan方法存在
    if (typeof service.generateTravelPlan !== 'function') {
      console.error('generateTravelPlan方法不存在');
      return false;
    }
    
    // 验证属性设置正确
    console.log('OpenAI客户端初始化状态:', {
      hasOpenAIClient: !!service.openai,
      baseUrl: service.baseUrl
    });
    
    console.log('代码结构验证通过');
    return true;
  }
  
  // 实际API调用测试
  try {
    const queryData = {
      destination: '北京',
      duration: '3天',
      travelType: '文化探索',
      interests: ['历史古迹', '美食']
    };
    
    console.log('发送旅行查询请求...');
    const result = await service.handleTravelQuery(queryData);
    
    console.log('\n=== 查询结果 ===');
    console.log('调用成功:', result.success);
    console.log('返回状态码:', result.statusCode);
    if (result.success) {
      console.log('\n响应数据:', typeof result.data === 'string' ? result.data.substring(0, 200) + '...' : result.data);
    } else {
      console.log('\n错误信息:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('\n测试失败，发生异常:', error.message);
    return false;
  }
}

/**
 * 测试函数：测试目的地推荐功能
 */
async function testDestinationRecommendation() {
  console.log('\n\n=== 测试目的地推荐功能 ===');
  
  const service = new AliyunBailianService();
  
  // 模拟测试 - 代码结构验证
  if (global.SKIP_ACTUAL_API_CALLS) {
    console.log('进行代码结构验证...');
    
    // 验证方法存在
    if (typeof service.recommendDestinations !== 'function') {
      console.error('recommendDestinations方法不存在');
      return false;
    }
    
    console.log('代码结构验证通过');
    return true;
  }
  
  // 实际API调用测试
  try {
    const preferences = {
      travelType: ['休闲度假'],
      budget: '中等',
      duration: '5-7天',
      season: '夏季',
      interests: ['海滩', '美食', '购物']
    };
    
    console.log('发送目的地推荐请求...');
    const result = await service.recommendDestinations(preferences);
    
    console.log('\n=== 推荐结果 ===');
    console.log('调用成功:', result.success);
    console.log('返回状态码:', result.statusCode);
    if (result.success) {
      console.log('\n推荐内容:', typeof result.data === 'string' ? result.data.substring(0, 200) + '...' : result.data);
    } else {
      console.log('\n错误信息:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('\n测试失败，发生异常:', error.message);
    return false;
  }
}

/**
 * 测试函数：测试核心generateTravelPlan方法
 */
async function testGenerateTravelPlan() {
  console.log('\n\n=== 测试核心API调用方法 ===');
  
  const service = new AliyunBailianService();
  
  // 模拟测试 - 代码结构验证
  if (global.SKIP_ACTUAL_API_CALLS) {
    console.log('进行代码结构验证...');
    
    // 验证请求参数格式
    const mockRequestData = {
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '测试系统提示'
        },
        {
          role: 'user',
          content: '测试用户输入'
        }
      ]
    };
    
    console.log('模拟请求参数结构验证通过:', mockRequestData);
    console.log('代码结构验证通过');
    return true;
  }
  
  // 实际API调用测试
  try {
    const requestData = {
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个旅行助手，回答要简洁。'
        },
        {
          role: 'user',
          content: '上海有哪些必去的景点？'
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    
    console.log('直接调用核心API方法...');
    const result = await service.generateTravelPlan(requestData);
    
    console.log('\n=== 核心方法调用结果 ===');
    console.log('调用成功:', result.success);
    console.log('返回状态码:', result.statusCode);
    if (result.success) {
      console.log('\n响应内容:', typeof result.data === 'string' ? result.data.substring(0, 150) + '...' : result.data);
    } else {
      console.log('\n错误信息:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('\n测试失败，发生异常:', error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('开始测试重构后的OpenAI客户端API调用功能...\n');
  
  // 检查环境变量
  const hasApiKey = !!process.env.DASHSCOPE_API_KEY;
  
  if (!hasApiKey) {
    console.warn('警告：未设置DASHSCOPE_API_KEY环境变量');
    console.warn('将进行代码结构验证，跳过实际API调用...\n');
  } else {
    console.log('环境检查通过，API密钥已配置');
  }
  
  // 全局标识是否进行实际API调用
  global.SKIP_ACTUAL_API_CALLS = !hasApiKey;
  
  // 运行所有测试
  const tests = [
    { name: '旅行查询', testFn: testTravelQuery },
    { name: '目的地推荐', testFn: testDestinationRecommendation },
    { name: '核心API调用', testFn: testGenerateTravelPlan }
  ];
  
  let allTestsPassed = true;
  
  for (const test of tests) {
    console.log(`\n\n======================================`);
    console.log(`开始测试: ${test.name}`);
    console.log(`======================================`);
    
    const testPassed = await test.testFn();
    allTestsPassed = allTestsPassed && testPassed;
    
    console.log(`\n${test.name}测试${testPassed ? '通过' : '失败'}`);
  }
  
  console.log('\n\n======================================');
  console.log('测试汇总:', allTestsPassed ? '所有测试通过' : '部分测试失败');
  console.log('======================================');
}

// 执行测试
runTests().catch(error => {
  console.error('测试过程中发生错误:', error);
});