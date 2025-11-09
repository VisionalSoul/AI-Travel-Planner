import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import './Settings.css';

const AIProviderSettings = () => {
  const { settings, updateApiKey, setAiProvider } = useSettings();
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [baiduKey, setBaiduKey] = useState(settings.baiduApiKey || '');
  const [baiduSecretKey, setBaiduSecretKey] = useState(settings.baiduSecretKey || '');
  const [aliyunBailianApiKey, setAliyunBailianApiKey] = useState(settings.aliyunBailianApiKey || '');
  const [selectedProvider, setSelectedProvider] = useState(settings.aiProvider || 'aliyun-bailian');

  // 保存API密钥
  const handleSaveKey = (provider) => {
    switch (provider) {
      case 'openai':
        updateApiKey('openaiApiKey', openaiKey);
        break;
      case 'anthropic':
        updateApiKey('anthropicApiKey', anthropicKey);
        break;
      case 'baidu':
        updateApiKey('baiduApiKey', baiduKey);
        updateApiKey('baiduSecretKey', baiduSecretKey);
        break;
      case 'aliyun-bailian':
        updateApiKey('aliyunBailianApiKey', aliyunBailianApiKey);
        break;
      default:
        break;
    }
  };

  // 选择AI服务提供商
  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    setAiProvider(provider);
  };

  return (
    <div className="ai-provider-settings">
      <h3>AI 服务提供商设置</h3>
      
      {/* 服务提供商选择 */}
      <div className="provider-selection">
        <label>选择服务提供商：</label>
        <div className="provider-options">
          <button 
            className={`provider-btn ${selectedProvider === 'aliyun-bailian' ? 'active' : ''}`}
            onClick={() => handleProviderChange('aliyun-bailian')}
          >
            阿里云百炼
          </button>
          <button 
            className={`provider-btn ${selectedProvider === 'openai' ? 'active' : ''}`}
            onClick={() => handleProviderChange('openai')}
          >
            OpenAI
          </button>
          <button 
            className={`provider-btn ${selectedProvider === 'anthropic' ? 'active' : ''}`}
            onClick={() => handleProviderChange('anthropic')}
          >
            Anthropic
          </button>
          <button 
            className={`provider-btn ${selectedProvider === 'baidu' ? 'active' : ''}`}
            onClick={() => handleProviderChange('baidu')}
          >
            百度
          </button>
        </div>
      </div>

      {/* 阿里云百炼配置 */}
      {selectedProvider === 'aliyun-bailian' && (
        <div className="provider-config">
          <h4>阿里云百炼平台配置</h4>
          <div className="input-group">
            <label htmlFor="aliyunBailianApiKey">API Key：</label>
            <input
              id="aliyunBailianApiKey"
              type="password"
              value={aliyunBailianApiKey}
              onChange={(e) => setAliyunBailianApiKey(e.target.value)}
              placeholder="请输入您的阿里云百炼API Key"
            />
            <button onClick={() => handleSaveKey('aliyun-bailian')}>保存</button>
          </div>
        </div>
      )}

      {/* OpenAI 配置 */}
      {selectedProvider === 'openai' && (
        <div className="provider-config">
          <h4>OpenAI 配置</h4>
          <div className="input-group">
            <label htmlFor="openaiKey">API Key：</label>
            <input
              id="openaiKey"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
            />
            <button onClick={() => handleSaveKey('openai')}>保存</button>
          </div>
        </div>
      )}

      {/* Anthropic 配置 */}
      {selectedProvider === 'anthropic' && (
        <div className="provider-config">
          <h4>Anthropic 配置</h4>
          <div className="input-group">
            <label htmlFor="anthropicKey">API Key：</label>
            <input
              id="anthropicKey"
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-api03-..."
            />
            <button onClick={() => handleSaveKey('anthropic')}>保存</button>
          </div>
        </div>
      )}

      {/* 百度配置 */}
      {selectedProvider === 'baidu' && (
        <div className="provider-config">
          <h4>百度 配置</h4>
          <div className="input-group">
            <label htmlFor="baiduKey">API Key：</label>
            <input
              id="baiduKey"
              type="password"
              value={baiduKey}
              onChange={(e) => setBaiduKey(e.target.value)}
              placeholder="..."
            />
            <button onClick={() => handleSaveKey('baidu')}>保存</button>
          </div>
          <div className="input-group">
            <label htmlFor="baiduSecretKey">Secret Key：</label>
            <input
              id="baiduSecretKey"
              type="password"
              value={baiduSecretKey}
              onChange={(e) => setBaiduSecretKey(e.target.value)}
              placeholder="..."
            />
            <button onClick={() => handleSaveKey('baidu')}>保存</button>
          </div>
        </div>
      )}

      <div className="info-box">
        <p><strong>注意：</strong>API 密钥将保存在您的浏览器本地存储中，不会上传到服务器。</p>
      </div>
    </div>
  );
};

export default AIProviderSettings;