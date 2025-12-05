import React, { useState } from 'react';
import { 
  Mic, Music, Sliders, Scissors, Layers, RefreshCw, Wand2, 
  Activity, CircleOff, FileText
} from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { AudioTTS } from './tools/AudioTTS';
import { AudioConverter } from './tools/AudioConverter';
import { AudioEditor } from './tools/AudioEditor';
import { AudioAnalyzer } from './tools/AudioAnalyzer';
import { AudioAIUtils } from './tools/AudioAIUtils';
import { AudioSTT } from './tools/AudioSTT';

// Data for all available audio tools
const audioTools: Tool[] = [
  // Basic
  { id: 'convert', name: '格式转换', description: '支持 MP3, WAV, AAC, FLAC 等格式互转。', category: 'basic', icon: RefreshCw, openSourceSolution: 'ffmpeg.wasm' },
  { id: 'trim', name: '音频剪辑', description: '可视化波形剪辑，精确到毫秒。', category: 'basic', icon: Scissors, openSourceSolution: 'wavesurfer.js' },
  { id: 'merge', name: '音频拼接', description: '将多段音频合并为单一文件。', category: 'basic', icon: Layers, openSourceSolution: 'ffmpeg.wasm' },
  
  // Advanced
  { id: 'speed', name: '变速变调', description: '调整播放速度和音调，不影响音质。', category: 'advanced', icon: Sliders, openSourceSolution: 'soundtouch.js' },
  { id: 'spectrum', name: '频谱分析', description: '实时可视化音频频率分布。', category: 'advanced', icon: Activity, openSourceSolution: 'Web Audio API' },
  
  // Innovative (AI)
  { id: 'stt', name: '音频转文字', description: '实时语音识别与文件转写 (ASR)。', category: 'innovative', icon: FileText, openSourceSolution: 'Web Speech API', isAiPowered: true },
  { id: 'tts', name: '文字转语音', description: 'AI 多语言语音合成，情感丰富。', category: 'innovative', icon: Mic, openSourceSolution: 'Gemini 2.5 TTS', isAiPowered: true },
  { id: 'enhance', name: '人声增强', description: '智能移除背景噪音，提取人声。', category: 'innovative', icon: Wand2, openSourceSolution: 'rnnoise-wasm / Gemini', isAiPowered: true },
  { id: 'separate', name: '伴奏提取', description: '分离人声和背景音乐。', category: 'innovative', icon: CircleOff, openSourceSolution: 'spleeter-web' },
];

export const AudioTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
  };

  const renderActiveTool = () => {
    switch (activeTool) {
        case 'stt':
            return <AudioSTT onBack={() => setActiveTool(null)} />;
        case 'tts':
            return <AudioTTS onBack={() => setActiveTool(null)} />;
        case 'convert':
            return <AudioConverter mode="convert" onBack={() => setActiveTool(null)} />;
        case 'merge':
            return <AudioConverter mode="merge" onBack={() => setActiveTool(null)} />;
        case 'trim':
            return <AudioEditor mode="trim" onBack={() => setActiveTool(null)} />;
        case 'speed':
            return <AudioEditor mode="speed" onBack={() => setActiveTool(null)} />;
        case 'spectrum':
            return <AudioAnalyzer onBack={() => setActiveTool(null)} />;
        case 'enhance':
            return <AudioAIUtils mode="enhance" onBack={() => setActiveTool(null)} />;
        case 'separate':
            return <AudioAIUtils mode="separate" onBack={() => setActiveTool(null)} />;
        default:
            return null;
    }
  };

  if (activeTool) {
    return renderActiveTool();
  }

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">音频大师</h1>
        <p className="text-lg text-muted">专业级音频处理、格式转换与 AI 语音合成工具。</p>
      </div>

      {/* Basic Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">基础工具</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioTools.filter(t => t.category === 'basic').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>

      {/* Advanced Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-accent rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">高级处理</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioTools.filter(t => t.category === 'advanced').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>

      {/* Innovative Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-secondary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">AI 实验室</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioTools.filter(t => t.category === 'innovative').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};