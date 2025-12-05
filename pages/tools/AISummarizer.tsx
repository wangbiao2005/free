import React, { useState } from 'react';
import { ArrowLeft, Upload, FileVideo, Sparkles, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { generateVideoSummary } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AISummarizerProps {
  onBack: () => void;
}

export const AISummarizer: React.FC<AISummarizerProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('请上传有效的视频文件。');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      // Simulation Note: Browsers can't easily upload 500MB videos to an API without backend pre-signed URLs.
      // We are simulating the "Analysis" phase by sending file metadata and user context to Gemini
      // to demonstrate the integration pattern. In a real app, we'd extract frames/audio client-side first.
      const summary = await generateVideoSummary(file.name, context || "未提供具体背景信息，请进行通用分析。");
      setResult(summary);
    } catch (err) {
      setError("生成摘要失败。请检查您的 API 密钥。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>返回工具列表</span>
      </button>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">AI 视频摘要助手</h2>
          </div>
          <p className="text-muted">上传视频，使用 Gemini AI 自动生成摘要、精彩看点和社交媒体标签。</p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all h-64
                ${isDragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                ${file ? 'bg-primary/5 border-primary/50' : ''}
              `}
            >
              <input 
                type="file" 
                id="video-upload" 
                accept="video/*" 
                className="hidden"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <FileVideo size={32} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    移除
                  </button>
                </div>
              ) : (
                <label htmlFor="video-upload" className="cursor-pointer space-y-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted group-hover:text-white transition-colors">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="font-medium text-white">点击上传或拖拽文件至此</p>
                    <p className="text-xs text-muted">支持 MP4, MOV, WEBM (最大 2GB)</p>
                  </div>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">背景备注（可选）</label>
              <textarea 
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 h-24 resize-none placeholder-gray-600"
                placeholder="例如：这是一个关于 React Hooks 的教程，重点在于 UseEffect..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!file || loading}
              className={`
                w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${!file || loading 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  正在分析内容...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  生成摘要
                </>
              )}
            </button>
            
            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="bg-black/20 rounded-xl border border-white/5 p-6 h-full min-h-[400px] overflow-y-auto">
            {result ? (
              <div className="space-y-4 animate-fadeIn">
                 <div className="flex items-center gap-2 text-green-400 mb-4">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">分析完成</span>
                 </div>
                 <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                 </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted text-center p-4">
                <Wand2 size={40} className="mb-4 text-white/10" />
                <p>生成的摘要、看点和标签将显示在这里。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};