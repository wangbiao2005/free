import React, { useState } from 'react';
import { 
  Scissors, FileVideo, Minimize2, Video, 
  Clapperboard, Type, Music, RefreshCw, 
  Wand2, Scan, ImagePlus, RotateCw
} from 'lucide-react';
import { Tool, VideoProcessingMode } from '../types';
import { ToolCard } from '../components/ToolCard';
import { AISummarizer } from './tools/AISummarizer';
import { VideoProcessor } from './tools/VideoProcessor';
import { VideoCreative } from './tools/VideoCreative';
import { VideoSubtitles } from './tools/VideoSubtitles';
import { VideoAudio } from './tools/VideoAudio';

// Data for all available tools
const videoTools: Tool[] = [
  // Basic
  { id: 'trim', name: '视频剪辑', description: '无损裁剪和修剪视频文件。', category: 'basic', icon: Scissors, openSourceSolution: 'ffmpeg.wasm' },
  { id: 'merge', name: '视频合并', description: '将多个片段合并为单条轨道。', category: 'basic', icon: Video, openSourceSolution: 'ffmpeg.wasm' },
  { id: 'convert', name: '格式转换', description: '在 MP4, MKV, AVI 和 WebM 之间转换。', category: 'basic', icon: RefreshCw, openSourceSolution: 'ffmpeg.wasm' },
  { id: 'compress', name: '视频压缩', description: '在保持画质的同时减小文件体积。', category: 'basic', icon: Minimize2, openSourceSolution: 'ffmpeg.wasm' },
  
  // Advanced
  { id: 'gif', name: 'GIF 制作', description: '将视频片段转换为优化过的 GIF 动图。', category: 'advanced', icon: FileVideo, openSourceSolution: 'gif.js' },
  { id: 'subtitle', name: '字幕提取', description: '从视频容器中提取或烧录字幕。', category: 'advanced', icon: Type, openSourceSolution: 'tesseract.js / ffmpeg' },
  { id: 'audio', name: '音频提取', description: '提取视频中的音轨并转换为 MP3/WAV。', category: 'advanced', icon: Music, openSourceSolution: 'ffmpeg.wasm' },
  { id: 'rotate', name: '旋转与翻转', description: '无需重新编码即可修复画面方向问题。', category: 'advanced', icon: RotateCw, openSourceSolution: 'ffmpeg.wasm' },

  // Innovative (AI)
  { id: 'summary', name: '自动摘要', description: '使用 AI 生成文本摘要和病毒式标签。', category: 'innovative', icon: Wand2, openSourceSolution: 'Gemini API', isAiPowered: true },
  { id: 'keyframe', name: '关键帧提取', description: '智能识别并提取最佳镜头。', category: 'innovative', icon: Scan, openSourceSolution: 'opencv.js' },
  { id: 'chromakey', name: '绿幕抠图', description: '在浏览器中进行色度键控背景移除。', category: 'innovative', icon: ImagePlus, openSourceSolution: 'canvas-green-screen' },
];

export const VideoTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
  };

  const renderActiveTool = () => {
    switch(activeTool) {
        case 'summary':
            return <AISummarizer onBack={() => setActiveTool(null)} />;
        case 'audio':
            return <VideoAudio onBack={() => setActiveTool(null)} />;
        case 'subtitle':
            return <VideoSubtitles onBack={() => setActiveTool(null)} />;
        case 'trim':
        case 'merge':
        case 'convert':
        case 'compress':
        case 'rotate':
            return <VideoProcessor mode={activeTool as VideoProcessingMode} onBack={() => setActiveTool(null)} />;
        case 'gif':
        case 'keyframe':
        case 'chromakey':
            return <VideoCreative mode={activeTool as any} onBack={() => setActiveTool(null)} />;
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
        <h1 className="text-4xl font-bold text-white tracking-tight">视频工作室</h1>
        <p className="text-lg text-muted">一套基于浏览器的全能视频处理实用工具。</p>
      </div>

      {/* Basic Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">基础必备</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoTools.filter(t => t.category === 'basic').map(tool => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoTools.filter(t => t.category === 'advanced').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>

      {/* Innovative Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-secondary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">AI 与创新</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTools.filter(t => t.category === 'innovative').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};
