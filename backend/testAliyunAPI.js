// 测试阿里云百炼API调用脚本
const aliyunBailianService = require('./src/services/aliyunBailianService');

async function testAPI() {
  console.log('开始测试阿里云百炼API调用...');
  
  try {
    // 测试简单的旅行查询
    const prompt = '请推荐一个3天的北京旅行计划，包含主要景点和美食。';
    const result = await aliyunBailianService.generateTravelPlan(prompt, 'qwen-plus');
    
    console.log('\n测试结果:');
    console.log('成功状态:', result.Success);
    console.log('响应代码:', result.Code);
    console.log('消息:', result.Message);
    
    if (result.Success && result.Data) {
      console.log('\n响应数据预览:');
      // 限制输出长度，避免控制台信息过多
      const dataStr = typeof result.Data === 'string' ? result.Data : JSON.stringify(result.Data);
      console.log(dataStr.substring(0, 500) + (dataStr.length > 500 ? '...' : ''));
    } else {
      console.error('\nAPI调用失败:', result.Message || '未知错误');
    }
    
  } catch (error) {
    console.error('\n测试过程中出现异常:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testAPI();

console.log('\n环境变量配置说明:');
console.log('1. 请在.env文件中设置以下变量:');
console.log('   DASHSCOPE_API_KEY=您的阿里云百炼API密钥');
console.log('   DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 (或新加坡地域: https://dashscope-intl.aliyuncs.com/compatible-mode/v1)');
console.log('2. 运行命令: node testAliyunAPI.js');