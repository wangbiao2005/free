import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileVideo, Save, Terminal, Loader2, CheckCircle2, Scissors, Layers, RefreshCw, Minimize2, RotateCw, Plus, X, Download } from 'lucide-react';
import { ProcessingStatus, VideoProcessingMode } from '../../types';
import { getFFmpegCommand } from '../../services/geminiService';

interface VideoProcessorProps {
  mode: VideoProcessingMode;
  onBack: () => void;
}

export const VideoProcessor: React.FC<VideoProcessorProps> = ({ mode, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Settings
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium'); // crf
  const [rotateAngle, setRotateAngle] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10); // seconds

  const addLog = (msg: string) => {
    setLogs(p => [...p, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(mode === 'merge' ? prev => [...prev, ...newFiles] : [newFiles[0]]);
      setStatus(ProcessingStatus.IDLE);
      setProgress(0);
      setLogs([]);
    }
  };

  const processVideo = async () => {
    if (files.length === 0) return;
    setStatus(ProcessingStatus.PROCESSING);
    setLogs(['初始化 FFmpeg 核心引擎...', '分配 WASM 内存堆...']);
    
    try {
      // 1. Generate Command
      let taskDesc = '';
      if (mode === 'convert') taskDesc = `Convert video to ${format}`;
      if (mode === 'compress') taskDesc = `Compress video with ${quality} quality`;
      if (mode === 'trim') taskDesc = `Trim video from ${trimStart}s to ${trimEnd}s`;
      if (mode === 'rotate') taskDesc = `Rotate video by ${rotateAngle} degrees`;
      if (mode === 'merge') taskDesc = `Merge ${files.length} video files`;

      const cmd = await getFFmpegCommand(taskDesc, 'video');
      addLog(`任务配置: ${taskDesc}`);
      addLog(`生成命令: ${cmd}`);

      // 2. Simulate Processing
      const totalSteps = 20;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(r => setTimeout(r, 150)); // Sim delay
        const pct = Math.round((i / totalSteps) * 100);
        setProgress(pct);
        
        if (i === 2) addLog(`分析输入流: ${files[0].name}...`);
        if (i === 5) addLog(`Stream #0:0(eng): Video: h264 (High), yuv420p`);
        if (i === 10 && mode === 'compress') addLog(`应用速率控制: CRF=${quality === 'high' ? 18 : quality === 'medium' ? 23 : 28}`);
        if (i === 15) addLog(`写入输出流... frame=${i * 100} fps=60 q=28.0 size=${(i * 0.5).toFixed(1)}MB`);
      }

      addLog('处理完成！');
      addLog('清理临时文件...');
      setStatus(ProcessingStatus.COMPLETED);

    } catch (e) {
      addLog('错误: 处理失败');
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (files.length === 0) return;
    // Mock download
    const url = URL.createObjectURL(files[0]);
    const link = document.createElement("a");
    link.href = url;
    const ext = mode === 'convert' ? format : files[0].name.split('.').pop();
    link.download = `processed_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = () => {
    switch(mode) {
        case 'trim': return <Scissors size={24} />;
        case 'merge': return <Layers size={24} />;
        case 'convert': return <RefreshCw size={24} />;
        case 'compress': return <Minimize2 size={24} />;
        case 'rotate': return <RotateCw size={24} />;
    }
  };

  const getTitle = () => {
    switch(mode) {
        case 'trim': return '视频剪辑';
        case 'merge': return '视频合并';
        case 'convert': return '格式转换';
        case 'compress': return '视频压缩';
        case 'rotate': return '旋转与翻转';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
       <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回视频工具</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config Panel - Top on Mobile, Left on Desktop */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getIcon()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
                        <p className="text-sm text-muted">FFmpeg Powered</p>
                    </div>
                </div>

                {/* Upload */}
                <div className="mb-6">
                    {files.length > 0 && mode !== 'merge' ? (
                        <div className="bg-black/20 rounded-xl p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileVideo size={24} className="text-primary flex-shrink-0" />
                                <div className="truncate min-w-0">
                                    <div className="text-sm text-white truncate max-w-[150px]">{files[0].name}</div>
                                    <div className="text-xs text-gray-500">{(files[0].size/1024/1024).toFixed(1)} MB</div>
                                </div>
                            </div>
                            <button onClick={() => setFiles([])} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className={`border-2 border-dashed border-white/10 rounded-xl p-6 lg:p-8 text-center transition-colors ${mode === 'merge' ? 'hover:border-primary/50' : 'hover:border-primary/50'}`}>
                            <input type="file" id="vid-up" accept="video/*" multiple={mode === 'merge'} className="hidden" onChange={handleFileChange} />
                            <label htmlFor="vid-up" className="cursor-pointer block space-y-2">
                                <Upload size={32} className="mx-auto text-muted" />
                                <p className="text-sm text-muted">点击上传{mode === 'merge' ? '多个' : ''}视频文件</p>
                            </label>
                        </div>
                    )}
                    
                    {/* Merge List */}
                    {mode === 'merge' && files.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5 text-sm">
                                    <span className="truncate flex-1 px-2">{f.name}</span>
                                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}><X size={14} className="text-gray-500"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Specific Controls */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                    
                    {mode === 'convert' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">目标格式</label>
                            <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                                <option value="mp4">MP4 (H.264)</option>
                                <option value="mkv">MKV (Matroska)</option>
                                <option value="avi">AVI</option>
                                <option value="webm">WebM (VP9)</option>
                            </select>
                        </div>
                    )}

                    {mode === 'compress' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">压缩质量</label>
                            <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                                <option value="high">高质量 (大文件)</option>
                                <option value="medium">平衡 (推荐)</option>
                                <option value="low">低质量 (最小文件)</option>
                            </select>
                        </div>
                    )}

                    {mode === 'rotate' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">旋转角度</label>
                            <div className="flex gap-2">
                                {[0, 90, 180, 270].map(deg => (
                                    <button 
                                        key={deg}
                                        onClick={() => setRotateAngle(deg)} 
                                        className={`flex-1 py-2 rounded-lg border text-sm transition-all ${rotateAngle === deg ? 'bg-primary text-white border-primary' : 'bg-black/20 border-white/5 text-gray-400'}`}
                                    >
                                        {deg}°
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'trim' && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs text-gray-500">开始 (秒)</label>
                                    <input type="number" value={trimStart} onChange={e => setTrimStart(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs text-gray-500">结束 (秒)</label>
                                    <input type="number" value={trimEnd} onChange={e => setTrimEnd(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={processVideo}
                        disabled={files.length === 0 || status === ProcessingStatus.PROCESSING}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition-all ${files.length === 0 || status === ProcessingStatus.PROCESSING ? 'bg-white/5 text-gray-500' : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
                    >
                        {status === ProcessingStatus.PROCESSING ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        {mode === 'merge' ? '开始合并' : '开始处理'}
                    </button>
                </div>
            </div>
        </div>

        {/* Output Panel - Bottom on Mobile, Right on Desktop */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
                {/* Header */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Terminal size={14} />
                        <span className="font-mono">FFmpeg Core Log</span>
                    </div>
                    {status === ProcessingStatus.PROCESSING && <span className="text-xs text-primary animate-pulse">Running...</span>}
                </div>

                {/* Log Area */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin bg-black/50">
                    {logs.length === 0 && <div className="text-gray-600 italic mt-4 text-center opacity-50">等待任务启动...</div>}
                    {logs.map((log, i) => (
                        <div key={i} className="text-gray-300 break-all">
                            <span className="text-primary mr-2">➜</span>{log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>

                {/* Progress & Action */}
                <div className="p-4 bg-surface border-t border-white/5">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    {status === ProcessingStatus.COMPLETED && (
                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-xl animate-fadeIn">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle2 size={18} />
                                <span className="font-medium text-sm">处理成功</span>
                            </div>
                            <button onClick={handleDownload} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors">
                                <Download size={14} /> 下载文件
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};