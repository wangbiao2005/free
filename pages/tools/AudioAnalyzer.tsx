import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Activity, Upload, Play, Square, Mic, Settings, Palette } from 'lucide-react';

interface AudioAnalyzerProps {
  onBack: () => void;
}

type Theme = 'cyberpunk' | 'retro' | 'midnight';

export const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [mode, setMode] = useState<'bars' | 'wave'>('bars');
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [smoothing, setSmoothing] = useState(0.85);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Keep track of mic stream to close it

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      if (audioElRef.current) {
        audioElRef.current.src = url;
      }
      setIsPlaying(false);
      setIsMicActive(false);
      stopMic(); // Ensure mic is off
    }
  };

  const initContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = smoothing;
    }
  };

  const startMic = async () => {
      try {
          if (audioContextRef.current?.state === 'suspended') {
              await audioContextRef.current.resume();
          }
          initContext();
          
          // Stop any previous stream
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          sourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
          sourceRef.current.connect(analyserRef.current!);
          
          setIsMicActive(true);
          setIsPlaying(true);
          setFile(null);
          draw();
      } catch (err) {
          console.error("Mic Error:", err);
          alert("无法访问麦克风");
      }
  };

  const stopMic = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
      }
      setIsMicActive(false);
      // Don't stop playing if we are playing a file, but here mic and file are exclusive
      if (!file) {
          setIsPlaying(false);
          if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      }
  };

  const togglePlayFile = async () => {
    if (!audioElRef.current || !file) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElRef.current.pause();
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      setIsPlaying(false);
    } else {
      initContext();
      // Ensure source is created only once for the element
      if (!sourceRef.current || !(sourceRef.current instanceof MediaElementAudioSourceNode)) {
          // Disconnect mic if active
          if (isMicActive) stopMic();
          
          sourceRef.current = audioContextRef.current!.createMediaElementSource(audioElRef.current);
          sourceRef.current.connect(analyserRef.current!);
          analyserRef.current!.connect(audioContextRef.current!.destination);
      }
      
      audioElRef.current.play();
      setIsPlaying(true);
      draw();
    }
  };

  useEffect(() => {
    if (analyserRef.current) {
        analyserRef.current.smoothingTimeConstant = smoothing;
    }
  }, [smoothing]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const vLines = 10;
      for (let i=1; i<vLines; i++) {
          const x = (i/vLines) * width;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.fillStyle = '#555';
          ctx.font = '10px monospace';
          ctx.fillText(`${i}k`, x + 2, height - 5);
      }
      const hLines = 5;
      for (let i=1; i<hLines; i++) {
          const y = (i/hLines) * height;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
      }
      ctx.stroke();
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure resizing handles correctly
    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (mode === 'bars') {
      analyserRef.current.getByteFrequencyData(dataArray);
    } else {
      analyserRef.current.getByteTimeDomainData(dataArray);
    }

    ctx.fillStyle = theme === 'midnight' ? '#0f172a' : '#09090b';
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height);

    if (mode === 'bars') {
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * (height / 255);
        
        let gradient = ctx.createLinearGradient(0, height, 0, 0);
        if (theme === 'cyberpunk') {
            gradient.addColorStop(0, '#a855f7');
            gradient.addColorStop(0.5, '#ec4899');
            gradient.addColorStop(1, '#22d3ee');
        } else if (theme === 'retro') {
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#ef4444');
        } else {
            gradient.addColorStop(0, '#1e40af');
            gradient.addColorStop(1, '#60a5fa');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = theme === 'cyberpunk' ? '#22d3ee' : theme === 'retro' ? '#f59e0b' : '#60a5fa';
      ctx.beginPath();
      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }

    animationIdRef.current = requestAnimationFrame(draw);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回音频工具</span>
      </button>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl h-full flex flex-col glass-card">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">频谱分析仪</h2>
                  <p className="text-sm text-muted">V3.1 (Mic Supported)</p>
                </div>
             </div>

             <div className="flex-1 space-y-6">
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center hover:border-green-500/50 transition-colors">
                    <input type="file" id="spec-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                    {file ? (
                        <div className="text-sm text-green-400 font-mono truncate">{file.name}</div>
                    ) : (
                        <label htmlFor="spec-upload" className="cursor-pointer block">
                            <Upload size={20} className="mx-auto text-muted mb-2" />
                            <span className="text-xs text-muted">Select Audio File</span>
                        </label>
                    )}
                </div>

                <div className="text-center text-xs text-muted relative">
                    <span className="bg-surface px-2 relative z-10">OR</span>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -z-0"></div>
                </div>

                <button 
                    onClick={isMicActive ? stopMic : startMic}
                    className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${isMicActive ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                    <Mic size={16} /> {isMicActive ? 'Stop Mic' : 'Use Microphone'}
                </button>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Palette size={12}/> Color Theme</label>
                    <div className="grid grid-cols-1 gap-2">
                        {(['cyberpunk', 'retro', 'midnight'] as Theme[]).map(t => (
                            <button 
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`text-left text-xs px-3 py-2 rounded-lg border transition-all capitalize ${theme === t ? 'border-green-500 bg-green-500/10 text-white' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                         <label className="text-xs font-bold text-gray-500 uppercase">FFT Smoothing</label>
                         <span className="text-xs text-green-400">{smoothing.toFixed(2)}</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="0.95" step="0.05"
                        value={smoothing}
                        onChange={(e) => setSmoothing(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>

                <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase">Vis Mode</label>
                     <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setMode('bars')} className={`flex-1 py-1.5 text-xs rounded transition-colors ${mode === 'bars' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Bars</button>
                        <button onClick={() => setMode('wave')} className={`flex-1 py-1.5 text-xs rounded transition-colors ${mode === 'wave' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Wave</button>
                     </div>
                </div>
             </div>

             <div className="mt-6">
                {!isMicActive && (
                    <button
                        onClick={togglePlayFile}
                        disabled={!file}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            !file ? 'bg-white/5 text-gray-500' : isPlaying ? 'bg-red-500/10 text-red-400 border border-red-500/50' : 'bg-green-600 text-white shadow-lg'
                        }`}
                        >
                        {isPlaying ? <><Square size={16} fill="currentColor"/> 停止</> : <><Play size={16} fill="currentColor"/> 播放 & 分析</>}
                    </button>
                )}
             </div>
           </div>
        </div>

        <div className="lg:col-span-9 bg-black border border-white/10 rounded-2xl p-1 shadow-2xl overflow-hidden relative min-h-[500px]">
           <canvas 
             ref={canvasRef} 
             width={1200} 
             height={600} 
             className="w-full h-full object-cover rounded-xl"
           />
           {!isPlaying && !file && !isMicActive && (
             <div className="absolute inset-0 flex items-center justify-center text-muted pointer-events-none">
                <div className="text-center">
                    <Mic size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="opacity-50 tracking-widest uppercase text-sm">No Signal Input</p>
                </div>
             </div>
           )}
           <audio ref={audioElRef} className="hidden" onEnded={() => setIsPlaying(false)} />
        </div>
      </div>
    </div>
  );
};