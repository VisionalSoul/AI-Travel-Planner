import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';

/**
 * Settings Hook - 管理应用的设置和API密钥
 */
export const useSettings = () => {
  // 初始化设置状态
  const [settings, setSettings] = useState({
    aiProvider: localStorage.getItem('ai_provider') || 'aliyun-bailian',
    openaiApiKey: localStorage.getItem('openaiApiKey') || '',
    anthropicApiKey: localStorage.getItem('anthropicApiKey') || '',
    baiduApiKey: localStorage.getItem('baiduApiKey') || '',
    baiduSecretKey: localStorage.getItem('baiduSecretKey') || '',
    aliyunBailianApiKey: localStorage.getItem('aliyunBailianApiKey') || ''
  });

  // 获取Pinia store实例
  const settingsStore = useSettingsStore();

  // 更新API密钥
  const updateApiKey = (keyName, value) => {
    // 更新本地状态
    setSettings(prev => ({
      ...prev,
      [keyName]: value
    }));
    
    // 保存到localStorage
    localStorage.setItem(keyName, value);
    
    // 对于阿里云百炼，同时更新到ai_api_key，以便aiService可以正确读取
    if (keyName === 'aliyunBailianApiKey') {
      localStorage.setItem('ai_api_key', value);
      // 同时更新Pinia store中的ai.apiKey
      settingsStore.setApiKey(value);
    }
    
    // 对于其他提供商，也更新到对应的ai_api_key
    if (keyName === 'openaiApiKey' && settings.aiProvider === 'openai') {
      localStorage.setItem('ai_api_key', value);
      settingsStore.setApiKey(value);
    }
    
    if (keyName === 'anthropicApiKey' && settings.aiProvider === 'anthropic') {
      localStorage.setItem('ai_api_key', value);
      settingsStore.setApiKey(value);
    }
    
    if (keyName === 'baiduApiKey' && settings.aiProvider === 'baidu') {
      localStorage.setItem('ai_api_key', value);
      settingsStore.setApiKey(value);
    }
  };

  // 设置AI服务提供商
  const setAiProvider = (provider) => {
    setSettings(prev => ({
      ...prev,
      aiProvider: provider
    }));
    
    localStorage.setItem('ai_provider', provider);
    settingsStore.setProvider(provider);
    
    // 切换提供商时，同步对应的API密钥到ai_api_key
    switch (provider) {
      case 'openai':
        localStorage.setItem('ai_api_key', settings.openaiApiKey || '');
        settingsStore.setApiKey(settings.openaiApiKey || '');
        break;
      case 'anthropic':
        localStorage.setItem('ai_api_key', settings.anthropicApiKey || '');
        settingsStore.setApiKey(settings.anthropicApiKey || '');
        break;
      case 'baidu':
        localStorage.setItem('ai_api_key', settings.baiduApiKey || '');
        settingsStore.setApiKey(settings.baiduApiKey || '');
        break;
      case 'aliyun-bailian':
        localStorage.setItem('ai_api_key', settings.aliyunBailianApiKey || '');
        settingsStore.setApiKey(settings.aliyunBailianApiKey || '');
        break;
      default:
        break;
    }
  };

  // 组件挂载时，从localStorage加载最新设置
  useEffect(() => {
    setSettings({
      aiProvider: localStorage.getItem('ai_provider') || 'aliyun-bailian',
      openaiApiKey: localStorage.getItem('openaiApiKey') || '',
      anthropicApiKey: localStorage.getItem('anthropicApiKey') || '',
      baiduApiKey: localStorage.getItem('baiduApiKey') || '',
      baiduSecretKey: localStorage.getItem('baiduSecretKey') || '',
      aliyunBailianApiKey: localStorage.getItem('aliyunBailianApiKey') || ''
    });
  }, []);

  return {
    settings,
    updateApiKey,
    setAiProvider
  };
};