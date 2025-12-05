import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Upload, Scissors, Sliders, Download, Volume2, ZoomIn, ZoomOut, MoveHorizontal, Wand2, Loader2, Save } from 'lucide-react';

interface AudioEditorProps {
  mode: 'trim' | 'speed';
  onBack: () => void;
}

export const AudioEditor: React.FC<AudioEditorProps> = ({ mode, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Editor State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Speed State
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);

  // Render State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setAudioUrl(url);
      setTrimStart(0);
      setTrimEnd(100);
      setPlaybackRate(1.0);
      setPitch(0);
      // Reset render state
      setIsRendering(false);
      setRenderComplete(false);
      setRenderProgress(0);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      
      if (mode === 'trim' && progress >= trimEnd) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current.currentTime = (trimStart / 100) * audioRef.current.duration;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      drawWaveform();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    drawWaveform();
  }, [trimStart, trimEnd, mode, zoom]); // Re-draw on zoom

  const drawWaveform = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Use actual display dimensions
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    
    // Set internal resolution to match display
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#09090b'; 
    ctx.fillRect(0, 0, width, height);

    // Draw Ruler (Top)
    ctx.fillStyle = '#3f3f46';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    
    for(let i=0; i<=10; i++) {
        const x = (i / 10) * width;
        ctx.fillRect(x, 0, 1, 15);
        if (duration > 0) {
            ctx.fillText(formatTime(duration * (i/10)), x, 25);
        }
    }
    // Sub-ticks
    ctx.fillStyle = '#27272a';
    for(let i=0; i<=50; i++) {
        const x = (i / 50) * width;
        ctx.fillRect(x, 0, 1, 8);
    }

    // Draw Bars (Simulated with Zoom)
    ctx.fillStyle = '#6366f1'; 
    const barBaseWidth = 4;
    const barWidth = barBaseWidth * zoom; 
    const gap = 2;
    const bars = Math.floor(width / (barWidth + gap));

    const centerY = (height + 30) / 2;

    for (let i = 0; i < bars; i++) {
        const seed = Math.sin(i * 0.2) * Math.cos(i * 0.5); 
        const h = Math.abs(seed) * (height * 0.6);
        const x = i * (barWidth + gap);
        ctx.fillRect(x, centerY - h/2, barWidth, h);
    }

    // Draw Trim Overlay
    if (mode === 'trim') {
        const startX = (trimStart / 100) * width;
        const endX = (trimEnd / 100) * width;

        // Masking Regions
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 30, startX, height - 30);
        ctx.fillRect(endX, 30, width - endX, height - 30);

        // Handles
        ctx.fillStyle = '#a855f7'; 
        ctx.fillRect(startX, 30, 2, height - 30);
        ctx.fillRect(endX - 2, 30, 2, height - 30);

        // Labels
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 12px Inter';
        ctx.fillText("IN", startX + 10, height - 10);
        ctx.fillText("OUT", endX - 15, height - 10);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    
    // Simulate rendering process
    const steps = 20;
    for(let i=1; i<=steps; i++) {
        await new Promise(r => setTimeout(r, 150));
        setRenderProgress(i * (100/steps));
    }
    
    setRenderComplete(true);
    setIsRendering(false);
  };

  const handleDownload = () => {
      if(!audioUrl || !file) return;
      
      const link = document.createElement("a");
      link.href = audioUrl; // In a real app this would be the processed blob URL
      const suffix = mode === 'trim' ? '_trimmed' : `_speed_${playbackRate}x`;
      const ext = file.name.split('.').pop();
      const name = file.name.split('.').slice(0, -1).join('.');
      
      link.download = `${name}${suffix}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回音频工具</span>
      </button>

      <div className="bg-surface border border-white/5 rounded-2xl p-4 lg:p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                {mode === 'trim' ? <Scissors size={24} /> : <Sliders size={24} />}
                </div>
                <div>
                <h2 className="text-xl font-bold text-white">{mode === 'trim' ? '非线性编辑 (NLE)' : '变速变调'}</h2>
                <p className="text-sm text-muted">专业级波形处理引擎</p>
                </div>
            </div>
            {audioUrl && (
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-1.5 hover:text-white text-gray-500"><ZoomOut size={16}/></button>
                        <span className="text-xs text-muted flex items-center px-2">{zoom.toFixed(1)}x</span>
                        <button onClick={() => setZoom(Math.min(3, zoom + 0.5))} className="p-1.5 hover:text-white text-gray-500"><ZoomIn size={16}/></button>
                    </div>
                    <button onClick={() => setFile(null)} className="text-sm text-red-400 hover:text-red-300 px-3">
                        新项目
                    </button>
                </div>
            )}
        </div>

        {!audioUrl ? (
             <div className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl p-8 lg:p-16 text-center transition-all">
                <input type="file" id="upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                <label htmlFor="upload" className="cursor-pointer space-y-4">
                    <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mx-auto text-muted mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={40} />
                    </div>
                    <div>
                        <p className="font-bold text-white text-xl">导入音频素材</p>
                        <p className="text-muted text-sm mt-2">支持拖拽或点击上传</p>
                    </div>
                </label>
             </div>
        ) : (
            <div className="space-y-6">
                {/* Timeline / Visualizer */}
                <div className="relative h-64 bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-inner group">
                    <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    
                    {/* Playhead */}
                    {duration > 0 && (
                        <div 
                            className="absolute top-[30px] bottom-0 w-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 pointer-events-none transition-all duration-100"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="w-3 h-3 bg-red-500 rotate-45 -ml-[5px] -mt-[6px]"></div>
                        </div>
                    )}
                </div>

                {/* Editor Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Main Playback (4 cols on desktop) */}
                    <div className="lg:col-span-4 bg-black/20 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center gap-4">
                         <div className="text-3xl font-mono text-white tracking-widest tabular-nums">
                            {formatTime(currentTime)}
                         </div>
                         <div className="text-xs text-muted font-mono mb-2">Total: {formatTime(duration)}</div>
                         
                         <div className="flex gap-4">
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause fill="currentColor" size={28}/> : <Play fill="currentColor" size={28} className="ml-1"/>}
                            </button>
                         </div>
                    </div>

                    {/* Specific Tools (8 cols on desktop) */}
                    <div className="lg:col-span-8 bg-black/20 rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                        {/* If Rendering */}
                        {isRendering ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <Loader2 size={32} className="text-indigo-500 animate-spin" />
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between text-xs text-muted">
                                        <span>正在渲染...</span>
                                        <span>{renderProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all duration-100" style={{ width: `${renderProgress}%` }} />
                                    </div>
                                </div>
                            </div>
                        ) : renderComplete ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fadeIn">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Save size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">渲染完成</h3>
                                    <p className="text-sm text-muted">文件大小: ~{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
                                >
                                    <Download size={18} /> 保存到本地
                                </button>
                                <button onClick={() => setRenderComplete(false)} className="text-xs text-muted hover:text-white underline">
                                    继续编辑
                                </button>
                            </div>
                        ) : (
                            <>
                            {mode === 'trim' ? (
                                <div className="space-y-6">
                                    {/* Sliders */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">裁剪范围</label>
                                            <div className="flex gap-4 text-xs font-mono text-white">
                                                <span className="bg-black/40 px-2 py-1 rounded">In: {formatTime((trimStart/100)*duration)}</span>
                                                <span className="bg-black/40 px-2 py-1 rounded">Out: {formatTime((trimEnd/100)*duration)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative h-2 bg-gray-700 rounded-full touch-none">
                                            {/* Range Indicator */}
                                            <div 
                                                className="absolute h-full bg-indigo-500 rounded-full opacity-50"
                                                style={{ left: `${trimStart}%`, width: `${trimEnd - trimStart}%` }}
                                            />
                                            <input 
                                                type="range" min="0" max="100" step="0.1" value={trimStart}
                                                onChange={(e) => { const v=Number(e.target.value); if(v<trimEnd) setTrimStart(v); }}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <input 
                                                type="range" min="0" max="100" step="0.1" value={trimEnd}
                                                onChange={(e) => { const v=Number(e.target.value); if(v>trimStart) setTrimEnd(v); }}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            {/* Thumbs visual hack */}
                                            <div className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow cursor-pointer pointer-events-none" style={{ left: `calc(${trimStart}% - 8px)` }} />
                                            <div className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow cursor-pointer pointer-events-none" style={{ left: `calc(${trimEnd}% - 8px)` }} />
                                        </div>
                                    </div>

                                    {/* Effects */}
                                    <div className="flex gap-6 border-t border-white/5 pt-4">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input type="checkbox" checked={fadeIn} onChange={e => setFadeIn(e.target.checked)} className="rounded bg-gray-700 border-transparent focus:ring-0 text-indigo-500" />
                                            淡入 (Fade In)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input type="checkbox" checked={fadeOut} onChange={e => setFadeOut(e.target.checked)} className="rounded bg-gray-700 border-transparent focus:ring-0 text-indigo-500" />
                                            淡出 (Fade Out)
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium text-white">Speed (速度)</label>
                                            <span className="text-sm font-bold text-indigo-400">{playbackRate.toFixed(1)}x</span>
                                        </div>
                                        <input 
                                            type="range" min="0.5" max="2.0" step="0.1"
                                            value={playbackRate}
                                            onChange={(e) => setPlaybackRate(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
                                            <span>0.5x</span>
                                            <span>Normal</span>
                                            <span>2.0x</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium text-white">Pitch (音调)</label>
                                            <span className="text-sm font-bold text-purple-400">{pitch > 0 ? `+${pitch}` : pitch}</span>
                                        </div>
                                        <input 
                                            type="range" min="-12" max="12" step="1"
                                            value={pitch}
                                            onChange={(e) => setPitch(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
                                            <span>-12</span>
                                            <span>0</span>
                                            <span>+12</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                <button 
                                    onClick={handleRender}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border border-white/5"
                                >
                                    <Download size={18} />
                                    渲染并导出
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                </div>

                <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden" 
                />
            </div>
        )}
      </div>
    </div>
  );
};