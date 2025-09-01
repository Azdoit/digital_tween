import { reactive, ref } from 'vue'

// 全局摄像头和音频状态管理
export const webcamStore = reactive({
  // 摄像头状态
  status: 'offline', // 'offline' | 'online' | 'loading'
  stream: null,
  errorMessage: '',
  loading: false,
  
  // 音频状态
  audioStatus: 'offline', // 'offline' | 'online' | 'loading'
  audioStream: null,
  audioErrorMessage: '',
  audioLoading: false,
  audioRecording: false,
  
  // 音频可视化相关
  audioContext: null,
  analyser: null,
  audioCanvas: null,
  audioCanvasContext: null,
  animationFrame: null,
  
  // 多画布支持
  canvases: {
    main: null,
    waveform: null,
    spectrum: null,
    volume: null
  },
  
  // 可视化数据缓存
  waveformHistory: [],
  volumeHistory: [],
  currentVisualizationType: 'waveform',
  
  // 音频录制相关
  mediaRecorder: null,
  audioChunks: [],
  
  // 视频元素引用（全局唯一）
  videoElement: null,
  
  // 开启摄像头
  async startCamera() {
    try {
      this.loading = true
      this.errorMessage = ''
      
      // 如果已经有视频流，直接返回
      if (this.stream && this.status === 'online') {
        this.loading = false
        return this.stream
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      this.stream = stream
      this.status = 'online'
      
      // 如果有video元素，立即绑定
      if (this.videoElement) {
        this.videoElement.srcObject = stream
      }
      
      return stream
      
    } catch (error) {
      console.error('无法访问摄像头:', error)
      let errorMessage = '摄像头启动失败'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '摄像头权限被拒绝'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '未找到摄像头设备'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '摄像头被其他应用占用'
      }
      
      this.errorMessage = errorMessage
      this.status = 'offline'
      throw new Error(errorMessage)
      
    } finally {
      this.loading = false
    }
  },
  
  // 关闭摄像头
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    this.status = 'offline'
    this.errorMessage = ''
    
    // 清除video元素的视频源
    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  },
  
  // 绑定video元素
  bindVideoElement(videoElement) {
    this.videoElement = videoElement
    
    // 如果已经有视频流，立即绑定
    if (this.stream && this.status === 'online') {
      videoElement.srcObject = this.stream
    }
  },
  
  // 解绑video元素
  unbindVideoElement() {
    this.videoElement = null
  },
  
  // 开启音频录制
  async startAudio() {
    try {
      this.audioLoading = true
      this.audioErrorMessage = ''
      
      // 如果已经有音频流，直接返回
      if (this.audioStream && this.audioStatus === 'online') {
        this.audioLoading = false
        return this.audioStream
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      this.audioStream = stream
      this.audioStatus = 'online'
      
      // 初始化音频可视化
      this.initAudioVisualization(stream)
      
      return stream
      
    } catch (error) {
      console.error('无法访问麦克风:', error)
      let errorMessage = '麦克风启动失败'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '麦克风权限被拒绝'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '未找到麦克风设备'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '麦克风被其他应用占用'
      }
      
      this.audioErrorMessage = errorMessage
      this.audioStatus = 'offline'
      throw new Error(errorMessage)
      
    } finally {
      this.audioLoading = false
    }
  },
  
  // 关闭音频录制
  stopAudio() {
    // 停止录制
    this.stopAudioRecording()
    
    // 停止可视化
    this.stopAudioVisualization()
    
    // 关闭音频流
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    
    this.audioStatus = 'offline'
    this.audioErrorMessage = ''
  },
  
  // 初始化音频可视化
  initAudioVisualization(stream) {
    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // 创建分析器
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      
      // 连接音频流
      const source = this.audioContext.createMediaStreamSource(stream)
      source.connect(this.analyser)
      
      // 开始可视化动画
      this.startAudioVisualization()
      
    } catch (error) {
      console.error('音频可视化初始化失败:', error)
    }
  },
  
  // 开始音频可视化
  startAudioVisualization() {
    if (!this.analyser) return
    
    const bufferLength = this.analyser.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    const timeDomainData = new Uint8Array(bufferLength)
    
    const draw = () => {
      this.animationFrame = requestAnimationFrame(draw)
      
      // 获取频域和时域数据
      this.analyser.getByteFrequencyData(frequencyData)
      this.analyser.getByteTimeDomainData(timeDomainData)
      
      // 计算当前音量（RMS）
      let rms = 0
      for (let i = 0; i < timeDomainData.length; i++) {
        const sample = (timeDomainData[i] - 128) / 128
        rms += sample * sample
      }
      rms = Math.sqrt(rms / timeDomainData.length)
      
      // 更新历史数据
      this.updateHistoryData(timeDomainData, rms)
      
      // 绘制所有可用的画布
      this.drawAllVisualizations(frequencyData, timeDomainData, rms)
    }
    
    draw()
  },
  
  // 更新历史数据
  updateHistoryData(timeDomainData, rms) {
    // 更新波形历史（保留最近200个采样点）
    this.waveformHistory.push([...timeDomainData])
    if (this.waveformHistory.length > 200) {
      this.waveformHistory.shift()
    }
    
    // 更新音量历史（保留最近100个点）
    this.volumeHistory.push(rms)
    if (this.volumeHistory.length > 100) {
      this.volumeHistory.shift()
    }
  },
  
  // 绘制单一可视化
  drawSingleVisualization(type, frequencyData, timeDomainData, rms) {
    const canvas = this.canvases.main
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    switch (type) {
      case 'waveform':
        this.drawWaveform(ctx, canvas, timeDomainData)
        break
      case 'spectrum':
        this.drawSpectrum(ctx, canvas, frequencyData)
        break
      case 'volume':
        this.drawVolumeHistory(ctx, canvas)
        break
    }
  },
  
  // 绘制所有可视化
  drawAllVisualizations(frequencyData, timeDomainData, rms) {
    // 绘制主画布（单图模式）
    if (this.canvases.main) {
      const ctx = this.canvases.main.getContext('2d')
      switch (this.currentVisualizationType) {
        case 'waveform':
          this.drawWaveform(ctx, this.canvases.main, timeDomainData)
          break
        case 'spectrum':
          this.drawSpectrum(ctx, this.canvases.main, frequencyData)
          break
        case 'volume':
          this.drawVolumeHistory(ctx, this.canvases.main)
          break
        case 'multi':
          this.drawWaveform(ctx, this.canvases.main, timeDomainData)
          break
      }
    }
    
    // 绘制波形图
    if (this.canvases.waveform) {
      const ctx = this.canvases.waveform.getContext('2d')
      this.drawWaveform(ctx, this.canvases.waveform, timeDomainData)
    }
    
    // 绘制频谱图
    if (this.canvases.spectrum) {
      const ctx = this.canvases.spectrum.getContext('2d')
      this.drawSpectrum(ctx, this.canvases.spectrum, frequencyData)
    }
    
    // 绘制音量历史
    if (this.canvases.volume) {
      const ctx = this.canvases.volume.getContext('2d')
      this.drawVolumeHistory(ctx, this.canvases.volume)
    }
    
    // 绘制迷你可视化（顶部状态栏）
    if (this.canvases.mini) {
      const ctx = this.canvases.mini.getContext('2d')
      this.drawMiniVisualization(ctx, this.canvases.mini, timeDomainData, rms)
    }
  },
  
  // 绘制实时波形图
  drawWaveform(ctx, canvas, timeDomainData) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.lineWidth = 2
    ctx.strokeStyle = '#00ff88'
    ctx.beginPath()
    
    const sliceWidth = canvas.width / timeDomainData.length
    let x = 0
    
    for (let i = 0; i < timeDomainData.length; i++) {
      const v = (timeDomainData[i] - 128) / 128
      const y = (v * canvas.height / 2) + canvas.height / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    ctx.stroke()
    
    // 绘制中心线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  },
  
  // 绘制频谱图
  drawSpectrum(ctx, canvas, frequencyData) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / frequencyData.length) * 2.5
    let x = 0
    
    for (let i = 0; i < frequencyData.length; i++) {
      const barHeight = (frequencyData[i] / 255) * canvas.height * 0.8
      
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      gradient.addColorStop(0, '#00ff88')
      gradient.addColorStop(0.5, '#00ccff')
      gradient.addColorStop(1, '#ff00cc')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      
      x += barWidth + 1
    }
  },
  
  // 绘制音量历史图
  drawVolumeHistory(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (this.volumeHistory.length < 2) return
    
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ffaa00'
    ctx.beginPath()
    
    const stepX = canvas.width / (this.volumeHistory.length - 1)
    
    for (let i = 0; i < this.volumeHistory.length; i++) {
      const x = i * stepX
      const y = canvas.height - (this.volumeHistory[i] * canvas.height)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
    
    // 添加填充渐变
    ctx.lineTo(canvas.width, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(255, 170, 0, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 170, 0, 0.05)')
    
    ctx.fillStyle = gradient
    ctx.fill()
  },
  
  // 绘制迷你可视化（顶部状态栏用）
  drawMiniVisualization(ctx, canvas, timeDomainData, rms) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 简单的音量条显示
    const barWidth = 3
    const barCount = Math.floor(canvas.width / (barWidth + 1))
    
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 1)
      // 使用采样点创建简单的可视化效果
      const sampleIndex = Math.floor((i / barCount) * timeDomainData.length)
      const sample = Math.abs((timeDomainData[sampleIndex] - 128) / 128)
      const barHeight = sample * canvas.height * 0.8
      
      // 根据音量大小设置颜色
      const intensity = Math.min(sample * 2, 1)
      ctx.fillStyle = `rgba(${Math.floor(255 * intensity)}, ${Math.floor(255 * (1 - intensity))}, 100, 0.8)`
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
    }
  },
  
  // 设置可视化类型
  setVisualizationType(type) {
    this.currentVisualizationType = type
  },
  
  // 停止音频可视化
  stopAudioVisualization() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.analyser = null
    
    // 清除画布
    if (this.audioCanvasContext && this.audioCanvas) {
      this.audioCanvasContext.clearRect(0, 0, this.audioCanvas.width, this.audioCanvas.height)
    }
  },
  
  // 绑定音频画布
  bindAudioCanvas(canvas, type = 'main') {
    this.canvases[type] = canvas
    
    // 主画布同时设置为audioCanvas保持兼容性
    if (type === 'main') {
      this.audioCanvas = canvas
      this.audioCanvasContext = canvas.getContext('2d')
    }
    
    // 如果音频已经开启，重新开始可视化
    if (this.audioStatus === 'online' && this.analyser) {
      this.startAudioVisualization()
    }
  },
  
  // 解绑音频画布
  unbindAudioCanvas(type = null) {
    if (type) {
      this.canvases[type] = null
    } else {
      // 清空所有画布
      Object.keys(this.canvases).forEach(key => {
        this.canvases[key] = null
      })
      this.audioCanvas = null
      this.audioCanvasContext = null
    }
    
    // 如果没有可用画布了，停止可视化
    const hasCanvas = Object.values(this.canvases).some(canvas => canvas !== null)
    if (!hasCanvas) {
      this.stopAudioVisualization()
    }
  },
  
  // 开始录制音频
  startAudioRecording() {
    if (!this.audioStream || this.audioStatus === 'offline') {
      throw new Error('请先开启麦克风')
    }
    
    if (this.audioRecording) {
      return
    }
    
    try {
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm'
      })
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        
        // 自动下载录音文件
        const a = document.createElement('a')
        a.href = url
        a.download = `recording-${new Date().getTime()}.webm`
        a.click()
        URL.revokeObjectURL(url)
      }
      
      this.mediaRecorder.start()
      this.audioRecording = true
      
    } catch (error) {
      console.error('开始录音失败:', error)
      throw new Error('录音功能初始化失败')
    }
  },
  
  // 停止录制音频
  stopAudioRecording() {
    if (this.mediaRecorder && this.audioRecording) {
      this.mediaRecorder.stop()
      this.audioRecording = false
      this.mediaRecorder = null
    }
  },
  
  // 检查浏览器支持
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },
  
  // 检查音频支持
  isAudioSupported() {
    return this.isSupported() && !!(window.AudioContext || window.webkitAudioContext)
  }
})

// 页面卸载时清理资源（整个应用关闭时）
window.addEventListener('beforeunload', () => {
  webcamStore.stopCamera()
  webcamStore.stopAudio()
})
