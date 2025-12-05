import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Upload, FileText, Loader2, StopCircle, Play, CheckCircle2, Copy, Download, FileAudio } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface AudioSTTProps {
  onBack: () => void;
}

// Type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const AudioSTT: React.FC<AudioSTTProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'mic' | 'file'>('mic');
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { show: showToast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Real-time Dictation Logic (Web Speech API) ---
  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionApi) {
      const recognition = new SpeechRecognitionApi();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN'; // Default to Chinese

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setText(prev => prev + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        showToast(`识别错误: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('您的浏览器不支持实时语音识别，请尝试使用 Chrome。', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      showToast('开始监听...', 'info');
    }
  };

  // --- File Transcription Simulation ---
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setText('');
      setLogs([]);
      setProgress(0);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLogs([]);
    setText('');
    
    const steps = [
      '初始化音频解码器...',
      '提取音频波形数据 (16kHz, Mono)...',
      '连接云端 ASR 推理引擎...',
      '检测语言: 中文 (Confidence: 0.99)...',
      '正在进行声学模型匹配...',
      '应用语言模型校正...',
      '生成标点符号与断句...',
      '完成转写。'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      addLog(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Dummy result for simulation
    const dummyText = `这是一个模拟的音频转文字结果。\n\n文件名：${file.name}\n时长：03:45\n\n[00:00:01] 大家好，欢迎使用音频大师工具箱。\n[00:00:05] 今天我们展示的是音频转文字功能，虽然这是基于前端的演示，但流程设计完全参考了真实的工业级 ASR 系统。\n[00:00:15] 您可以上传会议记录、讲座录音或者采访音频，我们将为您生成精确的文本记录。\n\n(此处为模拟生成的更多文本内容...)`;
    
    setText(dummyText);
    setIsProcessing(false);
    showToast('转写完成', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板', 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
          <ArrowLeft size={18} /> <span>返回音频工具</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">音频转文字</h2>
                  <p className="text-sm text-muted">Speech to Text (ASR)</p>
                </div>
             </div>

             {/* Mode Toggle */}
             <div className="flex bg-black/20 p-1 rounded-xl mb-6 border border-white/5">
                <button 
                  onClick={() => setMode('mic')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'mic' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Mic size={16} /> 实时听写
                </button>
                <button 
                   onClick={() => setMode('file')}
                   className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'file' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Upload size={16} /> 文件转写
                </button>
             </div>

             {/* Mode: Mic */}
             {mode === 'mic' && (
                <div className="text-center space-y-6 py-4">
                   <div className={`
                      w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300
                      ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' : 'bg-white/5 text-gray-500'}
                   `}>
                      <Mic size={40} />
                   </div>
                   <p className="text-sm text-gray-400 px-4">
                      {isListening ? '正在聆听... 请说话' : '点击下方按钮开始实时录音识别'}
                   </p>
                   <button 
                      onClick={toggleListening}
                      className={`
                        w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                        ${isListening ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}
                      `}
                   >
                      {isListening ? <><StopCircle size={18}/> 停止录音</> : <><Play size={18}/> 开始识别</>}
                   </button>
                </div>
             )}

             {/* Mode: File */}
             {mode === 'file' && (
                <div className="space-y-4">
                   <div className={`border-2 border-dashed border-white/10 rounded-xl p-6 text-center transition-colors ${file ? 'bg-emerald-500/5 border-emerald-500/30' : 'hover:border-emerald-500/50'}`}>
                      <input type="file" id="stt-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                      {file ? (
                        <div className="space-y-2">
                           <FileAudio size={32} className="mx-auto text-emerald-400" />
                           <p className="text-white font-medium truncate">{file.name}</p>
                           <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline">更换文件</button>
                        </div>
                      ) : (
                        <label htmlFor="stt-upload" className="cursor-pointer block space-y-2">
                           <Upload size={32} className="mx-auto text-muted" />
                           <p className="text-sm text-muted">点击或拖拽音频文件</p>
                        </label>
                      )}
                   </div>
                   <button 
                      onClick={processFile}
                      disabled={!file || isProcessing}
                      className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${!file || isProcessing ? 'bg-white/5 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                   >
                      {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>}
                      {isProcessing ? '正在转写...' : '开始转写'}
                   </button>
                   
                   {/* Progress */}
                   {isProcessing && (
                      <div className="space-y-1">
                         <div className="flex justify-between text-xs text-gray-400">
                            <span>Processing...</span>
                            <span>{progress.toFixed(0)}%</span>
                         </div>
                         <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                         </div>
                      </div>
                   )}
                   
                   {/* Logs */}
                   <div className="bg-black/40 rounded-xl p-3 h-32 overflow-y-auto scrollbar-thin text-xs font-mono border border-white/5">
                      {logs.map((log, i) => (
                         <div key={i} className="text-gray-400 mb-1"><span className="text-emerald-500 mr-2">➜</span>{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-[400px]">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col h-full shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <FileText size={18} /> 转写结果
                 </h3>
                 <div className="flex gap-2">
                    <button onClick={handleCopy} disabled={!text} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50">
                       <Copy size={14}/> 复制
                    </button>
                    <button onClick={handleDownload} disabled={!text} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50">
                       <Download size={14}/> 导出 TXT
                    </button>
                 </div>
              </div>
              
              <div className="flex-1 bg-black/20 rounded-xl p-6 border border-white/5 overflow-y-auto scrollbar-thin">
                 {text ? (
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap leading-relaxed text-gray-200">
                       {text}
                       {isListening && <span className="inline-block w-2 h-5 bg-emerald-500 ml-1 animate-pulse align-middle"></span>}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted/30">
                       <FileText size={64} className="mb-4" />
                       <p>识别到的文字将显示在这里...</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};