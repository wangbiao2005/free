import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, ImagePlus, Video, Scan, Download, Check, Settings2, Play, Pause } from 'lucide-react';

interface VideoCreativeProps {
  mode: 'gif' | 'keyframe' | 'chromakey';
  onBack: () => void;
}

export const VideoCreative: React.FC<VideoCreativeProps> = ({ mode, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // GIF Settings
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  
  // Keyframe Settings
  const [keyframes, setKeyframes] = useState<string[]>([]);
  
  // Chroma Settings
  const [chromaColor, setChromaColor] = useState('#00ff00');
  const [tolerance, setTolerance] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setVideoSrc(URL.createObjectURL(f));
      setKeyframes([]);
    }
  };

  // Mock GIF Generation
  const generateGif = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    alert("GIF 生成成功 (模拟)");
  };

  // Extract Keyframes Logic
  const extractKeyframes = () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    const duration = vid.duration;
    const count = 4;
    const interval = duration / count;
    const frames: string[] = [];

    setIsProcessing(true);
    
    // Helper to seek and capture
    const capture = (time: number) => {
        return new Promise<void>(resolve => {
            vid.currentTime = time;
            vid.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = vid.videoWidth / 4; // Thumbnail size
                canvas.height = vid.videoHeight / 4;
                canvas.getContext('2d')?.drawImage(vid, 0, 0, canvas.width, canvas.height);
                frames.push(canvas.toDataURL('image/jpeg'));
                resolve();
            };
        });
    };

    // Chain execution
    (async () => {
        for(let i=0; i<count; i++) {
            await capture(i * interval + 1); // +1s offset
        }
        setKeyframes(frames);
        setIsProcessing(false);
    })();
  };

  // Chroma Key Loop
  useEffect(() => {
    if (mode !== 'chromakey' || !videoRef.current || !canvasRef.current) return;
    
    let animationId: number;
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    const render = () => {
        if (vid.paused || vid.ended) return;
        
        ctx?.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const frame = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!frame) return;

        const l = frame.data.length / 4;
        const target = hexToRgb(chromaColor);
        
        for (let i = 0; i < l; i++) {
            const r = frame.data[i * 4 + 0];
            const g = frame.data[i * 4 + 1];
            const b = frame.data[i * 4 + 2];

            // Simple Euclidean distance
            const dist = Math.sqrt(
                Math.pow(r - target.r, 2) + 
                Math.pow(g - target.g, 2) + 
                Math.pow(b - target.b, 2)
            );

            if (dist < tolerance) {
                frame.data[i * 4 + 3] = 0; // Alpha 0
            }
        }
        
        ctx?.putImageData(frame, 0, 0);
        animationId = requestAnimationFrame(render);
    };

    vid.addEventListener('play', () => {
        canvas.width = vid.videoWidth;
        canvas.height = vid.videoHeight;
        render();
    });

    return () => cancelAnimationFrame(animationId);
  }, [mode, chromaColor, tolerance, videoSrc]);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回视频工具</span>
      </button>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                        {mode === 'gif' && <ImagePlus size={24} />}
                        {mode === 'keyframe' && <Scan size={24} />}
                        {mode === 'chromakey' && <Video size={24} />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {mode === 'gif' && 'GIF 制作'}
                            {mode === 'keyframe' && '关键帧提取'}
                            {mode === 'chromakey' && '绿幕抠图'}
                        </h2>
                        <p className="text-sm text-muted">Creative Studio</p>
                    </div>
                </div>

                {!file ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-secondary/50 transition-colors">
                        <input type="file" id="c-upload" accept="video/*" className="hidden" onChange={handleFileChange} />
                        <label htmlFor="c-upload" className="cursor-pointer block space-y-2">
                            <Upload size={32} className="mx-auto text-muted" />
                            <p className="text-sm text-muted">上传视频素材</p>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-white font-medium bg-black/20 p-2 rounded border border-white/5 truncate">{file.name}</div>
                        
                        {mode === 'gif' && (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">FPS</label>
                                    <input type="range" min="5" max="30" value={fps} onChange={e => setFps(Number(e.target.value))} className="w-full accent-secondary" />
                                    <div className="text-right text-xs text-secondary">{fps}</div>
                                </div>
                                <button onClick={generateGif} disabled={isProcessing} className="w-full py-2 bg-secondary text-white rounded-lg font-bold">
                                    {isProcessing ? '生成中...' : '生成 GIF'}
                                </button>
                            </div>
                        )}

                        {mode === 'keyframe' && (
                            <button onClick={extractKeyframes} disabled={isProcessing} className="w-full py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all">
                                {isProcessing ? '提取中...' : 'AI 智能提取'}
                            </button>
                        )}

                        {mode === 'chromakey' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase font-bold">背景颜色 (Key Color)</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={chromaColor} onChange={e => setChromaColor(e.target.value)} className="h-10 w-full rounded cursor-pointer" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs text-gray-500 uppercase font-bold">容差 (Tolerance)</label>
                                        <span className="text-xs text-secondary">{tolerance}</span>
                                    </div>
                                    <input type="range" min="1" max="250" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full accent-secondary" />
                                </div>
                                <p className="text-xs text-gray-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                    提示：播放视频以实时预览抠图效果。
                                </p>
                            </div>
                        )}
                        
                        <button onClick={() => { setFile(null); setVideoSrc(null); }} className="w-full py-2 text-xs text-red-400 hover:bg-white/5 rounded">移除文件</button>
                    </div>
                )}
            </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <Settings2 size={16} /> 预览工作台
            </h3>
            
            {videoSrc ? (
                <div className="flex-1 flex flex-col gap-4">
                    {mode === 'chromakey' ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Transparency_demonstration_1.png')] bg-repeat">
                             <canvas ref={canvasRef} className="w-full h-auto block" />
                             {/* Hidden source video */}
                             <video 
                                ref={videoRef} 
                                src={videoSrc} 
                                crossOrigin="anonymous" 
                                controls 
                                className="absolute bottom-4 right-4 w-32 h-auto rounded border border-white shadow-xl z-10" 
                             />
                        </div>
                    ) : (
                        <video ref={videoRef} src={videoSrc} controls className="w-full rounded-xl border border-white/10 bg-black max-h-[400px]" />
                    )}

                    {/* Keyframe Grid */}
                    {mode === 'keyframe' && keyframes.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4 animate-fadeIn">
                            {keyframes.map((src, i) => (
                                <div key={i} className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-secondary transition-colors">
                                    <img src={src} alt={`Keyframe ${i}`} className="w-full h-auto" />
                                    <a href={src} download={`keyframe_${i}.jpg`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <Download size={20} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted">
                    <Video size={48} className="mb-4 opacity-20" />
                    <p>等待素材导入...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
