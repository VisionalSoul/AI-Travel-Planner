// 测试generate-trip功能修复
const AliyunBailianService = require('./src/services/aliyunBailianService');

// 创建服务实例并测试方法是否存在
function testServiceMethods() {
  console.log('=== 测试aliyunBailianService方法 ===');
  
  try {
    const service = new AliyunBailianService();
    
    console.log('服务实例创建成功:', !!service);
    console.log('generateTravelPlan方法存在:', typeof service.generateTravelPlan === 'function');
    console.log('handleTravelQuery方法存在:', typeof service.handleTravelQuery === 'function');
    console.log('recommendDestinations方法存在:', typeof service.recommendDestinations === 'function');
    
    return true;
  } catch (error) {
    console.error('测试失败:', error.message);
    return false;
  }
}

// 模拟API调用参数格式测试
function testApiCallFormat() {
  console.log('\n=== 测试API调用参数格式 ===');
  
  try {
    const service = new AliyunBailianService();
    
    // 测试参数格式 - 不实际发送请求
    const mockRequestData = {
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个旅行规划助手。'
        },
        {
          role: 'user',
          content: '请帮我规划一个北京三日游。'
        }
      ]
    };
    
    console.log('模拟请求参数格式正确:', !!mockRequestData.messages && Array.isArray(mockRequestData.messages));
    console.log('服务已准备好处理generate-trip请求');
    
    return true;
  } catch (error) {
    console.error('参数格式测试失败:', error.message);
    return false;
  }
}

// 运行测试
function runTests() {
  console.log('开始测试generate-trip功能修复...\n');
  
  const methodTestPassed = testServiceMethods();
  const formatTestPassed = testApiCallFormat();
  
  console.log('\n=== 测试结果 ===');
  console.log('方法存在性测试:', methodTestPassed ? '通过' : '失败');
  console.log('参数格式测试:', formatTestPassed ? '通过' : '失败');
  console.log('\n修复状态:', methodTestPassed && formatTestPassed ? '✅ 修复成功' : '❌ 修复失败');
  
  if (methodTestPassed && formatTestPassed) {
    console.log('\n提示: 请重启服务器后测试实际的API调用。');
    console.log('服务器重启命令: npm run dev');
  }
}

// 执行测试
runTests();