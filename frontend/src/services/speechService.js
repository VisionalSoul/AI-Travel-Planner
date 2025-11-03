// 语音识别服务
class SpeechService {
  constructor(speechSettings = {}) {
    this.recognition = null
    this.isListening = false
    this.supported = this.checkSupport()
    this.settings = speechSettings
  }

  // 更新设置
  updateSettings(speechSettings) {
    this.settings = speechSettings
    if (this.recognition) {
      // 如果已经初始化了识别器，更新语言设置
      this.recognition.lang = speechSettings.language || 'zh-CN'
    }
  }

  // 开始监听（兼容接口）
  async startListening(options = {}) {
    return new Promise((resolve, reject) => {
      this.start(
        options.onResult || (() => {}),
        options.onError || ((error) => reject(error)),
        () => resolve()
      )
    })
  }

  // 停止监听（兼容接口）
  async stopListening() {
    if (this.recognition) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  // 检查浏览器是否支持语音识别
  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  // 初始化语音识别
  init(options = {}) {
    if (!this.supported) {
      console.error('您的浏览器不支持语音识别功能')
      return false
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    this.recognition = new SpeechRecognition()

    // 设置语音识别选项
    this.recognition.continuous = options.continuous || false
    this.recognition.interimResults = options.interimResults || true
    this.recognition.lang = options.lang || 'zh-CN'
    this.recognition.maxAlternatives = options.maxAlternatives || 1

    return true
  }

  // 开始语音识别
  start(onResult, onError, onEnd) {
    if (!this.recognition) {
      this.init()
    }

    if (this.isListening) {
      return
    }

    this.isListening = true

    // 设置结果回调
    this.recognition.onresult = (event) => {
      let transcript = ''
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript
          confidence = event.results[i][0].confidence
        }
      }

      if (transcript && onResult) {
        onResult({
          transcript,
          confidence
        })
      }
    }

    // 设置错误回调
    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error)
      if (onError) {
        onError(event.error)
      }
      this.isListening = false
    }

    // 设置结束回调
    this.recognition.onend = () => {
      this.isListening = false
      if (onEnd) {
        onEnd()
      }
    }

    // 开始识别
    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('开始语音识别失败:', error)
      this.isListening = false
      return false
    }
  }

  // 停止语音识别
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      return true
    }
    return false
  }

  // 中止语音识别
  abort() {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
      return true
    }
    return false
  }

  // 语音合成（文字转语音）
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.error('您的浏览器不支持语音合成功能')
      return false
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || 'zh-CN'
    utterance.volume = options.volume || 1
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1

    if (options.onEnd) {
      utterance.onend = options.onEnd
    }

    if (options.onError) {
      utterance.onerror = options.onError
    }

    window.speechSynthesis.speak(utterance)
    return true
  }

  // 停止所有语音合成
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // 获取可用的语音列表
  getAvailableVoices() {
    if (!('speechSynthesis' in window)) {
      return []
    }
    return window.speechSynthesis.getVoices()
  }

  // 检查是否正在监听
  getIsListening() {
    return this.isListening
  }

  // 检查是否支持语音识别
  getIsSupported() {
    return this.supported
  }
}

// 导出类
export default SpeechService