import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Play, Square, Volume2, Sparkles, Loader2, History, Trash2, Settings2, Download, User } from 'lucide-react';
import { generateTextToSpeech } from '../../services/geminiService';

interface AudioTTSProps {
  onBack: () => void;
}

interface TTSHistoryItem {
  id: string;
  text: string;
  voiceName: string;
  date: number;
  audioData: string; // Base64
}

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', style: '平衡/全能', desc: '适合新闻播报与日常对话' },
  { id: 'Puck', name: 'Puck', gender: 'Male', style: '柔和/低沉', desc: '适合有声书与情感讲述' },
  { id: 'Kore', name: 'Kore', gender: 'Female', style: '清晰/高昂', desc: '适合教程解说与广告' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', style: '深沉/权威', desc: '适合纪录片与正式场合' },
  { id: 'Charon', name: 'Charon', gender: 'Male', style: '磁性/成熟', desc: '适合电影解说' },
];

export const AudioTTS: React.FC<AudioTTSProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioData, setCurrentAudioData] = useState<string | null>(null);
  
  // Advanced Controls
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0); 
  
  // History
  const [history, setHistory] = useState<TTSHistoryItem[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tts_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('tts_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Helper: Convert Base64 to Float32Array
  const decodeBase64Audio = (base64String: string) => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
  };

  const playAudio = async (base64String: string, rate: number = 1.0) => {
    try {
      if (sourceNodeRef.current) sourceNodeRef.current.stop();

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const dataInt16 = decodeBase64Audio(base64String);
      const frameCount = dataInt16.length;
      const audioBuffer = audioContextRef.current.createBuffer(1, frameCount, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = rate;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
      setCurrentAudioData(base64String);
      
    } catch (e) {
      console.error("Audio playback error:", e);
      setError("音频解码或播放失败，请重试。");
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      setIsPlaying(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    stopAudio();

    try {
      const base64Audio = await generateTextToSpeech(text, selectedVoice);
      await playAudio(base64Audio, speed);
      
      const newItem: TTSHistoryItem = {
        id: Date.now().toString(),
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        voiceName: selectedVoice,
        date: Date.now(),
        audioData: base64Audio
      };
      // Keep only last 20 items to save space
      setHistory(prev => [newItem, ...prev].slice(0, 20));

    } catch (err) {
      setError("生成语音失败。请检查网络或 API Key。");
    } finally {
      setLoading(false);
    }
  };

  const writeWavHeader = (samples: Int16Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.byteLength);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.byteLength, true);

    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset + i * 2, samples[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const downloadAudio = (base64Data: string, filename: string) => {
    try {
        const pcmData = decodeBase64Audio(base64Data);
        const wavBlob = writeWavHeader(pcmData, 24000); 
        
        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Download failed", e);
        setError("文件生成失败");
    }
  };

  const clearHistory = () => {
    if(confirm('确定要清空生成记录吗？')) {
      setHistory([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => { stopAudio(); onBack(); }}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>返回音频工具</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
          <Sparkles size={14} />
          AI 语音合成引擎 V2.5
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
          <div className="bg-surface border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} /> 选择声音
            </h3>
            <div className="space-y-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`
                    w-full p-3 rounded-xl text-left transition-all border relative overflow-hidden group
                    ${selectedVoice === voice.id 
                      ? 'bg-secondary/10 border-secondary text-white shadow-lg shadow-secondary/10' 
                      : 'bg-black/20 border-white/5 text-muted hover:bg-white/5 hover:text-gray-200'
                    }
                  `}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="font-bold">{voice.name}</div>
                      <div className="text-xs opacity-70 mt-1">{voice.style}</div>
                    </div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded border ${selectedVoice === voice.id ? 'border-secondary/50 bg-secondary/20' : 'border-white/10 bg-white/5'}`}>
                      {voice.gender}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 line-clamp-1">{voice.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-5 shadow-lg">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 size={16} /> 参数调节
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-white">语速 (Speed)</label>
                  <span className="text-xs font-mono text-secondary">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-white">语调 (Pitch)</label>
                  <span className="text-xs font-mono text-secondary">{pitch > 0 ? `+${pitch}` : pitch}</span>
                </div>
                <input 
                  type="range" min="-5" max="5" step="1" value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <p className="text-[10px] text-gray-500">*注：语调通过客户端后处理模拟</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          <div className="bg-surface border border-white/5 rounded-2xl p-1 flex-1 flex flex-col shadow-lg relative">
             <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入文本，AI 将赋予它生命..."
                className="w-full h-full bg-black/20 rounded-xl p-6 text-lg text-white focus:outline-none resize-none placeholder-gray-600 leading-relaxed scrollbar-thin"
              />
              <div className="absolute bottom-6 right-6 text-xs text-gray-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                {text.length} 字符
              </div>
          </div>

          <div className="flex items-center gap-4">
             <button
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
                className={`
                  flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-lg
                  ${loading || !text.trim()
                    ? 'bg-surface border border-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-secondary to-pink-600 text-white hover:opacity-90 shadow-xl shadow-secondary/20'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    正在合成音频流...
                  </>
                ) : (
                  <>
                    <Mic size={24} />
                    立即生成语音
                  </>
                )}
              </button>
              
              {isPlaying ? (
                <button
                  onClick={stopAudio}
                  className="h-full px-8 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Square size={20} fill="currentColor" /> 停止
                </button>
              ) : currentAudioData ? (
                  <button
                  onClick={() => downloadAudio(currentAudioData, `tts-${Date.now()}`)}
                  className="h-full px-8 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Download size={24} /> 下载 WAV
                </button>
              ) : (
                <div className="h-full px-8 rounded-xl bg-surface border border-white/5 text-muted flex items-center justify-center">
                  <Volume2 size={24} />
                </div>
              )}
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className="bg-surface border border-white/5 rounded-2xl p-5 shadow-lg max-h-[250px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <History size={16} /> 生成记录
                </h3>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
                        <Trash2 size={12} /> 清空
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
               {history.length === 0 ? (
                 <div className="text-center text-gray-600 py-8 text-sm">暂无生成记录</div>
               ) : (
                 history.map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-secondary hover:text-white transition-colors" onClick={() => playAudio(item.audioData, speed)}>
                           <Play size={12} fill="currentColor" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-white truncate max-w-[200px]">{item.text}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{item.voiceName}</span>
                            <span>•</span>
                            <span>{new Date(item.date).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => downloadAudio(item.audioData, `tts-${item.id}`)} 
                            className="p-2 hover:text-green-400 text-gray-500" 
                            title="下载 WAV"
                         >
                           <Download size={14} />
                         </button>
                         <button onClick={() => setHistory(h => h.filter(i => i.id !== item.id))} className="p-2 hover:text-red-400 text-gray-500">
                           <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};