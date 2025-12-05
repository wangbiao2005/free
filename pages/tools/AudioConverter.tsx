import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileAudio, RefreshCw, Layers, CheckCircle2, Download, Terminal, Plus, X, Tag, Settings, PlayCircle } from 'lucide-react';
import { ProcessingStatus } from '../../types';

interface AudioConverterProps {
  mode: 'convert' | 'merge';
  onBack: () => void;
}

interface AudioFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  processedUrl?: string;
}

export const AudioConverter: React.FC<AudioConverterProps> = ({ mode, onBack }) => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  
  // Format Settings
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192k');
  const [sampleRate, setSampleRate] = useState('44100');
  const [channels, setChannels] = useState('2');
  
  // Metadata Settings (Simulated)
  const [metaTitle, setMetaTitle] = useState('');
  const [metaArtist, setMetaArtist] = useState('');
  const [showMeta, setShowMeta] = useState(false);

  // System State
  const [globalStatus, setGlobalStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        status: 'pending' as const,
        progress: 0
      }));
      
      setAudioFiles(prev => [...prev, ...newFiles]);
      setGlobalStatus(ProcessingStatus.IDLE);
    }
  };

  const removeFile = (id: string) => {
    setAudioFiles(prev => prev.filter(f => f.id !== id));
  };

  const mockProcessFile = (file: File, newFormat: string): string => {
      // In a real app, this would be ffmpeg.wasm processing.
      // Here we return the original blob just to demonstrate the download capability working
      // but we pretend it's the new format by naming it later.
      return URL.createObjectURL(file);
  }

  const startProcessing = async () => {
    if (audioFiles.length === 0) return;
    
    setGlobalStatus(ProcessingStatus.PROCESSING);
    setLogs(['初始化音频引擎...', '加载 WASM 编解码器...']);
    
    if (mode === 'convert') {
        // Process sequentially
        for (let i = 0; i < audioFiles.length; i++) {
            const current = audioFiles[i];
            
            // Update UI to processing
            setAudioFiles(prev => prev.map(f => f.id === current.id ? { ...f, status: 'processing', progress: 0 } : f));
            addLog(`开始转码: ${current.file.name}`);
            
            // Simulate Progress
            for (let p = 0; p <= 100; p += 20) {
                await new Promise(r => setTimeout(r, 150));
                setAudioFiles(prev => prev.map(f => f.id === current.id ? { ...f, progress: p } : f));
            }

            const mockUrl = mockProcessFile(current.file, format);

            addLog(`写入元数据: Title=${metaTitle || current.file.name}, Artist=${metaArtist || 'Unknown'}`);
            addLog(`完成转码: ${current.file.name} -> ${format.toUpperCase()}`);
            
            setAudioFiles(prev => prev.map(f => f.id === current.id ? { 
                ...f, 
                status: 'done', 
                progress: 100,
                processedUrl: mockUrl
            } : f));
        }
    } else {
        // Merge Mode
        addLog(`准备合并 ${audioFiles.length} 个文件...`);
        for (let i = 0; i < audioFiles.length; i++) {
            setAudioFiles(prev => prev.map(f => f.id === audioFiles[i].id ? { ...f, status: 'processing', progress: 100 } : f));
            addLog(`读取音频流: ${audioFiles[i].file.name}`);
            await new Promise(r => setTimeout(r, 200));
        }
        addLog(`执行拼接操作... Output: ${sampleRate}Hz, ${channels === '2' ? 'Stereo' : 'Mono'}`);
        await new Promise(r => setTimeout(r, 1000));
        addLog('合并完成！');
        
        // We pretend the first file is the result for simulation
        const mergedUrl = mockProcessFile(audioFiles[0].file, format);
        setAudioFiles(prev => prev.map(f => ({ ...f, status: 'done', processedUrl: mergedUrl })));
    }

    setGlobalStatus(ProcessingStatus.COMPLETED);
    addLog('所有任务已完成。');
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回音频工具</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: File List & Main Area (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    {mode === 'convert' ? <RefreshCw size={24} /> : <Layers size={24} />}
                    </div>
                    <div>
                    <h2 className="text-xl font-bold text-white">{mode === 'convert' ? '格式工厂' : '音频拼接'}</h2>
                    <p className="text-sm text-muted">批量处理任务队列</p>
                    </div>
                </div>
                <div>
                     <input type="file" id="add-more" accept="audio/*" multiple className="hidden" onChange={handleFileChange} />
                     <label htmlFor="add-more" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors border border-white/5">
                        <Plus size={16} /> 添加文件
                     </label>
                </div>
             </div>

             {/* File Table */}
             <div className="flex-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                {audioFiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} className="text-muted" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">暂无文件</h3>
                        <p className="text-muted text-sm max-w-xs mb-6">拖拽音频文件到此处，或点击右上角添加按钮开始处理</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full scrollbar-thin">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium">文件名</th>
                                    <th className="px-4 py-3 font-medium w-32">大小</th>
                                    <th className="px-4 py-3 font-medium w-48">状态</th>
                                    <th className="px-4 py-3 font-medium w-16">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {audioFiles.map((f) => (
                                    <tr key={f.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <FileAudio size={16} className="text-blue-400 flex-shrink-0" />
                                                <span className="truncate max-w-[150px] lg:max-w-[200px]">{f.file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{(f.file.size / 1024 / 1024).toFixed(2)} MB</td>
                                        <td className="px-4 py-3">
                                            {f.status === 'pending' && <span className="text-gray-500">等待中</span>}
                                            {f.status === 'processing' && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-blue-400">
                                                        <span>处理中</span>
                                                        <span>{f.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${f.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            {f.status === 'done' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={14}/> 完成</span>
                                                    {mode === 'convert' && f.processedUrl && (
                                                        <button 
                                                            onClick={() => triggerDownload(f.processedUrl!, `${f.file.name.split('.')[0]}.${format}`)}
                                                            className="text-xs bg-white/10 hover:bg-green-600 px-2 py-1 rounded text-white flex items-center gap-1 transition-colors"
                                                        >
                                                            <Download size={10} /> 下载
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => removeFile(f.id)} className="text-gray-500 hover:text-red-400 p-1">
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
             </div>
           </div>
           
           {/* Terminal Log */}
           <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[200px] font-mono text-sm">
             <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2 text-muted">
               <Terminal size={14} />
               <span>System Output</span>
             </div>
             <div className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin">
               {logs.map((log, i) => (
                 <div key={i} className="text-gray-400 text-xs break-all">
                   <span className="text-blue-500 mr-2">{'>'}</span>{log}
                 </div>
               ))}
               <div ref={logsEndRef} />
             </div>
           </div>
        </div>

        {/* Right: Settings & Action (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Settings size={16} /> 导出设置
               </h3>
               
               <div className="space-y-5">
                   {/* Format */}
                   <div className="space-y-2">
                        <label className="text-sm text-white">目标格式</label>
                        <select 
                            value={format} 
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-500/50 outline-none appearance-none"
                        >
                            <option value="mp3">MP3 Audio</option>
                            <option value="wav">WAV (Uncompressed)</option>
                            <option value="aac">AAC (High Efficiency)</option>
                            <option value="flac">FLAC (Lossless)</option>
                            <option value="ogg">OGG Vorbis</option>
                        </select>
                   </div>
                   
                   {/* Quality */}
                   <div className="space-y-2">
                        <label className="text-sm text-white">音频质量</label>
                        <select 
                            value={bitrate} 
                            onChange={(e) => setBitrate(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-500/50 outline-none appearance-none"
                        >
                            <option value="128k">128 kbps (标准)</option>
                            <option value="192k">192 kbps (推荐)</option>
                            <option value="320k">320 kbps (最高)</option>
                        </select>
                   </div>

                   {/* Advanced Toggle */}
                   <div className="pt-2 border-t border-white/5">
                        <div className="space-y-4 mt-2">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">采样率</label>
                                    <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-sm text-white">
                                        <option value="44100">44.1 kHz</option>
                                        <option value="48000">48 kHz</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">声道</label>
                                    <select value={channels} onChange={(e) => setChannels(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-sm text-white">
                                        <option value="2">Stereo</option>
                                        <option value="1">Mono</option>
                                    </select>
                                </div>
                             </div>
                        </div>
                   </div>

                   {/* Metadata Editor Toggle */}
                   <div className="pt-2 border-t border-white/5">
                        <button onClick={() => setShowMeta(!showMeta)} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium">
                            <Tag size={12} /> {showMeta ? '隐藏元数据' : '编辑元数据标签'}
                        </button>
                        
                        {showMeta && (
                            <div className="space-y-3 mt-3 animate-fadeIn p-3 bg-black/20 rounded-lg">
                                <input 
                                    placeholder="标题 (Title)" 
                                    value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 p-1 text-sm text-white focus:border-blue-500 outline-none" 
                                />
                                <input 
                                    placeholder="艺术家 (Artist)" 
                                    value={metaArtist} onChange={e => setMetaArtist(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 p-1 text-sm text-white focus:border-blue-500 outline-none" 
                                />
                                <p className="text-[10px] text-gray-600 mt-1">*仅适用于支持 ID3 的格式</p>
                            </div>
                        )}
                   </div>
                    
                    {/* Main Action Button */}
                    {mode === 'merge' && globalStatus === ProcessingStatus.COMPLETED && audioFiles[0]?.processedUrl ? (
                        <button
                            onClick={() => triggerDownload(audioFiles[0].processedUrl!, `merged_audio.${format}`)}
                            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl bg-green-600 hover:bg-green-500 text-white"
                        >
                            <Download size={20} /> 下载合并文件
                        </button>
                    ) : (
                        <button
                            onClick={startProcessing}
                            disabled={audioFiles.length === 0 || globalStatus === ProcessingStatus.PROCESSING}
                            className={`
                            w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl
                            ${audioFiles.length === 0 || globalStatus === ProcessingStatus.PROCESSING
                                ? 'bg-white/5 text-gray-500' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                            }
                            `}
                        >
                            {globalStatus === ProcessingStatus.PROCESSING ? '处理中...' : (mode === 'convert' ? '开始转换' : '开始合并')}
                        </button>
                    )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};