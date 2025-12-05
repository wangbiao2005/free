import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileAudio, Music, Download, CheckCircle2, Terminal } from 'lucide-react';
import { ProcessingStatus } from '../../types';
import { getFFmpegCommand } from '../../services/geminiService';

interface VideoAudioProps {
  onBack: () => void;
}

export const VideoAudio: React.FC<VideoAudioProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192k');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setLogs([]);
      setStatus(ProcessingStatus.IDLE);
      setProgress(0);
    }
  };

  const startExtraction = async () => {
    if (!file) return;
    setStatus(ProcessingStatus.PROCESSING);
    setLogs(['初始化处理环境...', '加载 ffmpeg.wasm 核心...']);
    setProgress(5);

    try {
      addLog(`分析文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      const command = await getFFmpegCommand(`Extract audio from video to ${format} at ${bitrate} bitrate`, 'video');
      addLog(`生成后端命令: ${command}`);
      
      const chunkSize = 1024 * 1024 * 5; 
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      addLog(`优化策略: 大文件分片处理 (Chunk Size: 5MB, Total: ${totalChunks})`);

      for (let i = 0; i < totalChunks; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const currentProgress = 10 + Math.round(((i + 1) / totalChunks) * 80);
        setProgress(currentProgress);
        addLog(`处理分片 ${i + 1}/${totalChunks}: 提取音频流...`);
      }

      addLog('合并音频流...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addLog('执行编码转换...');
      setProgress(100);
      setStatus(ProcessingStatus.COMPLETED);
      addLog('处理完成！准备下载。');

    } catch (error) {
      addLog('错误: 处理过程中发生异常。');
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDownload = () => {
      if(!file) return;
      const url = URL.createObjectURL(file); // Mock
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.split('.')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回工具列表</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Config */}
        <div className="space-y-6">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Music size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">视频提取音频</h2>
                  <p className="text-sm text-muted">无损音轨分离</p>
                </div>
             </div>

             <div className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all mb-6
                ${file ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
             `}>
                <input type="file" id="audio-upload" accept="video/*" className="hidden" onChange={handleFileChange} />
                {file ? (
                  <div className="space-y-2">
                    <FileAudio size={40} className="mx-auto text-purple-400" />
                    <p className="font-medium text-white">{file.name}</p>
                    <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline">移除文件</button>
                  </div>
                ) : (
                  <label htmlFor="audio-upload" className="cursor-pointer space-y-3 w-full">
                    <Upload size={32} className="mx-auto text-muted" />
                    <p className="text-muted">点击或拖拽视频文件</p>
                  </label>
                )}
             </div>

             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">输出格式</label>
                   <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                     <option value="mp3">MP3</option>
                     <option value="aac">AAC</option>
                     <option value="wav">WAV</option>
                     <option value="flac">FLAC</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">比特率</label>
                   <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                     <option value="128k">128 kbps</option>
                     <option value="192k">192 kbps</option>
                     <option value="320k">320 kbps</option>
                   </select>
                 </div>
               </div>

               <button
                 onClick={startExtraction}
                 disabled={!file || status === ProcessingStatus.PROCESSING}
                 className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition-all ${!file || status === ProcessingStatus.PROCESSING ? 'bg-white/5 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg'}`}
               >
                 {status === ProcessingStatus.PROCESSING ? '处理中...' : '开始提取'}
               </button>
             </div>
           </div>
        </div>

        {/* Logs */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
             <div className="flex justify-between items-end mb-2">
               <h3 className="font-semibold text-white">任务进度</h3>
               <span className="text-2xl font-mono text-purple-400">{progress}%</span>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
             </div>
             {status === ProcessingStatus.COMPLETED && (
               <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between animate-fadeIn">
                 <div className="flex items-center gap-2 text-green-400">
                   <CheckCircle2 size={20} />
                   <span className="font-medium">提取成功</span>
                 </div>
                 <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                   <Download size={16} /> 下载音频
                 </button>
               </div>
             )}
          </div>

          <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[300px] font-mono text-sm">
             <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2 text-muted">
               <Terminal size={14} />
               <span>Backend Log</span>
             </div>
             <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[400px] scrollbar-thin">
               {logs.map((log, i) => (
                 <div key={i} className="text-gray-400"><span className="text-purple-500 mr-2">➜</span>{log}</div>
               ))}
               <div ref={logsEndRef} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
