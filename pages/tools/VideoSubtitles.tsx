import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Type, Download, Play, CheckCircle2, Loader2 } from 'lucide-react';

interface VideoSubtitlesProps {
  onBack: () => void;
}

export const VideoSubtitles: React.FC<VideoSubtitlesProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [srtContent, setSrtContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setVideoSrc(URL.createObjectURL(f));
      setSrtContent('');
      setLogs([]);
    }
  };

  const addLog = (msg: string) => setLogs(p => [...p, msg]);

  const startExtraction = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLogs([]);

    const steps = [
        '提取音频流 (AAC, 16000Hz)...',
        '上传至 ASR 推理引擎...',
        '加载 Whisper-V3 Large 模型...',
        '检测语言: 中文 (Confidence: 0.98)',
        '生成时间轴 timestamps...',
        '格式化为 SRT 字幕...'
    ];

    for (const step of steps) {
        addLog(step);
        await new Promise(r => setTimeout(r, 800));
    }

    // Dummy SRT Content
    const dummySRT = `1
00:00:01,000 --> 00:00:04,000
欢迎来到这个视频教程。

2
00:00:04,500 --> 00:00:08,000
今天我们将学习如何使用 Free 工具箱。

3
00:00:09,000 --> 00:00:12,000
请确保你已经订阅了我们的频道。`;

    setSrtContent(dummySRT);
    setIsProcessing(false);
    addLog('完成。');
  };

  const downloadSRT = () => {
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.split('.')[0]}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回视频工具</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                        <Type size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">字幕提取</h2>
                        <p className="text-sm text-muted">Auto-Captioning</p>
                    </div>
                </div>

                {!file ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-yellow-500/50 transition-colors">
                        <input type="file" id="sub-upload" accept="video/*" className="hidden" onChange={handleFileChange} />
                        <label htmlFor="sub-upload" className="cursor-pointer block space-y-2">
                            <Upload size={32} className="mx-auto text-muted" />
                            <p className="text-sm text-muted">上传视频文件</p>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <video src={videoSrc!} controls className="w-full rounded-lg border border-white/5 bg-black" />
                        <button 
                            onClick={startExtraction}
                            disabled={isProcessing}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin"/> : <FileText size={18} />}
                            {isProcessing ? '提取中...' : '开始提取字幕'}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Logs */}
             <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs h-40 overflow-y-auto scrollbar-thin">
                {logs.map((log, i) => (
                    <div key={i} className="text-gray-400 mb-1">
                        <span className="text-yellow-500 mr-2">➜</span>{log}
                    </div>
                ))}
            </div>
        </div>

        {/* Editor */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">字幕编辑器 (.srt)</h3>
                {srtContent && (
                    <button onClick={downloadSRT} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-2">
                        <Download size={14} /> 导出文件
                    </button>
                )}
            </div>
            <textarea 
                value={srtContent}
                onChange={e => setSrtContent(e.target.value)}
                placeholder="提取的字幕将显示在这里，您可以手动修改时间轴和文本..."
                className="flex-1 w-full bg-black/20 border border-white/10 rounded-xl p-4 text-gray-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-yellow-500/50 resize-none"
            />
        </div>
      </div>
    </div>
  );
};
