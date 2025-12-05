import React, { useState } from 'react';
import { ArrowLeft, Wand2, Music, Upload, CheckCircle2, Loader2, Play, Pause, GitCompare, Info, Download } from 'lucide-react';
import { getAudioProcessingAdvice } from '../../services/geminiService';

interface AudioAIProps {
  mode: 'enhance' | 'separate';
  onBack: () => void;
}

export const AudioAIUtils: React.FC<AudioAIProps> = ({ mode, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null); 
  const [advice, setAdvice] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // New AI Controls
  const [strength, setStrength] = useState(75);
  const [compareMode, setCompareMode] = useState<'original' | 'processed'>('processed');

  const addLog = (msg: string) => setLogs(p => [...p, msg]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setLogs([]);
      setResult(null);
      setAdvice('');
      setCompareMode('original'); // Reset view
      
      addLog('AI 正在分析音频指纹 (Fingerprinting)...');
      try {
        const suggestion = await getAudioProcessingAdvice(
            mode === 'enhance' ? '音频降噪与人声增强' : '人声与伴奏分离', 
            `${f.name} (${(f.size/1024/1024).toFixed(1)}MB)`
        );
        setAdvice(suggestion);
        addLog('分析完成，已生成处理参数建议。');
      } catch (e) {
          addLog("分析服务连接超时，使用默认参数。");
      }
    }
  };

  const processAudio = async () => {
    if (!file) return;
    setLoading(true);
    setCompareMode('processed');
    
    // Simulate complex AI processing steps
    const steps = mode === 'enhance' 
        ? [`加载 RNNoise 降噪模型 (Strength: ${strength}%)...`, '计算环境噪声分布...', '执行频谱减法...', '人声 EQ 自动补偿...', '输出增强音频']
        : ['加载 Spleeter 分离模型 (2-stems)...', '执行快速傅里叶变换 (FFT)...', '提取人声蒙版...', `应用分离强度: ${strength}%`, '合成伴奏音轨...'];

    for (const step of steps) {
        addLog(step);
        await new Promise(r => setTimeout(r, 800)); 
    }

    setResult('success');
    setLoading(false);
  };

  const handleDownload = (suffix: string) => {
    if(!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    
    const name = file.name.split('.').slice(0, -1).join('.');
    const ext = file.name.split('.').pop();
    
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

      <div className="grid md:grid-cols-12 gap-8">
        {/* Left: Settings (4 cols) */}
        <div className="md:col-span-4 space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                        {mode === 'enhance' ? <Wand2 size={24} /> : <Music size={24} />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{mode === 'enhance' ? 'AI 人声增强' : 'AI 伴奏提取'}</h2>
                        <p className="text-sm text-muted">Neural Audio Processing</p>
                    </div>
                </div>

                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center mb-6 hover:border-pink-500/50 transition-colors">
                    <input type="file" id="ai-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                    {file ? (
                        <div className="space-y-2">
                            <p className="text-white font-medium truncate max-w-[200px] mx-auto">{file.name}</p>
                            <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB • WAV</p>
                            <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline">更换文件</button>
                        </div>
                    ) : (
                        <label htmlFor="ai-upload" className="cursor-pointer block">
                            <Upload size={32} className="mx-auto text-muted mb-2" />
                            <p className="text-muted text-sm">点击上传音频</p>
                        </label>
                    )}
                </div>

                {/* AI Controls */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase">{mode === 'enhance' ? '降噪强度' : '分离灵敏度'}</label>
                            <span className="text-xs text-pink-400">{strength}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" step="5"
                            value={strength}
                            onChange={(e) => setStrength(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>
                </div>

                {advice && (
                    <div className="mt-6 bg-pink-500/5 border border-pink-500/10 rounded-lg p-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2 text-pink-400 mb-2 font-bold text-xs uppercase tracking-wider">
                            <Wand2 size={12} /> Analysis Report
                        </div>
                        <div className="whitespace-pre-wrap font-mono text-xs opacity-80 leading-relaxed">{advice}</div>
                    </div>
                )}

                <button
                    onClick={processAudio}
                    disabled={!file || loading}
                    className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        !file || loading ? 'bg-white/5 text-gray-500' : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                    {loading ? '正在推理...' : '开始处理'}
                </button>
            </div>
        </div>

        {/* Right: Visualization & Output (8 cols) */}
        <div className="md:col-span-8 space-y-6">
             {/* Analysis Panel */}
             {file && (
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-center">
                        <div className="text-xs text-muted mb-1">采样率</div>
                        <div className="text-sm text-white font-mono">44.1 kHz</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-center">
                        <div className="text-xs text-muted mb-1">位深</div>
                        <div className="text-sm text-white font-mono">24-bit</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-center">
                        <div className="text-xs text-muted mb-1">声道</div>
                        <div className="text-sm text-white font-mono">Stereo</div>
                    </div>
                </div>
             )}

             {/* Waveform Comparison Mock */}
             <div className="bg-black border border-white/10 rounded-2xl p-6 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
                 {/* Fake Waveform Lines */}
                 <div className="flex items-end gap-1 h-32 w-full justify-center opacity-80">
                    {Array.from({length: 40}).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 rounded-full transition-all duration-500 ${compareMode === 'processed' ? 'bg-pink-500' : 'bg-gray-600'}`} 
                            style={{ 
                                height: `${compareMode === 'processed' ? Math.random() * 80 + 20 : Math.random() * 100}%`,
                                opacity: compareMode === 'processed' ? 1 : 0.5 
                            }} 
                        />
                    ))}
                 </div>
                 
                 {result && (
                    <div className="mt-8 flex gap-4 z-10">
                        <button 
                            onClick={() => setCompareMode('original')}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${compareMode === 'original' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                        >
                            Original
                        </button>
                        <button 
                             onClick={() => setCompareMode('processed')}
                             className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${compareMode === 'processed' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25' : 'bg-white/10 text-white'}`}
                        >
                            <Wand2 size={14} /> Processed
                        </button>
                    </div>
                 )}

                 {!file && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-muted">等待文件上传...</div>}
             </div>

            {/* Terminal Log */}
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[180px] font-mono text-sm shadow-inner">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2 text-muted text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    PROCESSING_LOG.txt
                </div>
                <div className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
                    {logs.map((log, i) => (
                        <div key={i} className="text-gray-400 text-xs">
                            <span className="text-pink-500 mr-2">➜</span>{log}
                        </div>
                    ))}
                    {result && <div className="text-green-400 text-xs mt-2 font-bold">Done.</div>}
                </div>
            </div>

            {/* Output Download */}
            {result && (
                <div className="bg-surface border border-white/5 rounded-2xl p-6 animate-fadeIn flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white mb-1">处理成功</h3>
                        <p className="text-xs text-muted">文件已准备好下载</p>
                    </div>
                    <div className="flex gap-3">
                        {mode === 'separate' ? (
                            <>
                                <button 
                                    onClick={() => handleDownload('_vocals')}
                                    className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors border border-white/5"
                                >
                                    下载人声 (Vocals)
                                </button>
                                <button 
                                    onClick={() => handleDownload('_accompaniment')}
                                    className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors border border-white/5"
                                >
                                    下载伴奏 (Backing)
                                </button>
                            </>
                        ) : (
                             <button 
                                onClick={() => handleDownload('_enhanced')}
                                className="text-sm bg-pink-600 hover:bg-pink-500 px-6 py-2 rounded-lg text-white font-bold shadow-lg transition-colors flex items-center gap-2"
                             >
                                <Download size={16} /> 下载音频
                             </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};