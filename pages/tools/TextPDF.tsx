import React, { useState } from 'react';
import { ArrowLeft, FileText, Upload, Download, Loader2, CheckCircle2, Files, Scissors, Minimize2, Image, X, Plus } from 'lucide-react';

interface TextPDFProps {
  mode: 'merge' | 'split' | 'compress' | 'img-to';
  onBack: () => void;
}

export const TextPDF: React.FC<TextPDFProps> = ({ mode, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => mode === 'merge' || mode === 'img-to' ? [...prev, ...newFiles] : [newFiles[0]]);
      setIsDone(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPDF = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    // Simulate PDF Processing steps
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 100)); // Simulate delay
        setProgress(i * (100 / steps));
    }

    setIsProcessing(false);
    setIsDone(true);
  };

  const handleDownload = () => {
      // Mock Download
      const blob = new Blob(["Simulated PDF Content"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed_document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getTitle = () => {
      switch(mode) {
          case 'merge': return 'PDF 合并';
          case 'split': return 'PDF 分割';
          case 'compress': return 'PDF 压缩';
          case 'img-to': return '图片转 PDF';
      }
  };

  const getIcon = () => {
      switch(mode) {
          case 'merge': return <Files size={24} />;
          case 'split': return <Scissors size={24} />;
          case 'compress': return <Minimize2 size={24} />;
          case 'img-to': return <Image size={24} />;
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回文档工具</span>
      </button>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                {getIcon()}
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
                <p className="text-sm text-muted">Secure Local Processing</p>
            </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
            <div className={`border-2 border-dashed border-white/10 rounded-xl p-8 text-center transition-colors ${files.length > 0 ? 'bg-white/5' : 'hover:border-red-500/50'}`}>
                <input 
                    type="file" 
                    id="pdf-upload" 
                    accept={mode === 'img-to' ? "image/*" : ".pdf"} 
                    multiple={mode === 'merge' || mode === 'img-to'} 
                    className="hidden" 
                    onChange={handleFileChange} 
                />
                
                {files.length === 0 ? (
                    <label htmlFor="pdf-upload" className="cursor-pointer space-y-3 block">
                        <Upload size={40} className="mx-auto text-muted" />
                        <p className="text-muted">点击或拖拽上传 {mode === 'img-to' ? '图片' : 'PDF'} 文件</p>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={20} className="text-red-400 flex-shrink-0" />
                                        <div className="text-left overflow-hidden">
                                            <div className="text-sm text-white truncate max-w-[300px]">{file.name}</div>
                                            <div className="text-xs text-gray-500">{(file.size/1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="p-1 hover:text-red-400 text-gray-500"><X size={16}/></button>
                                </div>
                            ))}
                        </div>
                        {(mode === 'merge' || mode === 'img-to') && (
                            <label htmlFor="pdf-upload" className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 cursor-pointer">
                                <Plus size={14} /> 添加更多文件
                            </label>
                        )}
                    </div>
                )}
            </div>

            {/* Config Area */}
            {files.length > 0 && !isDone && !isProcessing && (
                <div className="animate-fadeIn">
                    {mode === 'split' && (
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                            <label className="text-sm text-gray-400 mb-2 block">分割模式</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-white"><input type="radio" name="split" defaultChecked className="accent-red-500" /> 提取所有页面</label>
                                <label className="flex items-center gap-2 text-sm text-white"><input type="radio" name="split" className="accent-red-500" /> 按范围分割 (例如 1-5)</label>
                            </div>
                        </div>
                    )}
                    
                    {mode === 'compress' && (
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                             <label className="text-sm text-gray-400 mb-2 block">压缩强度</label>
                             <input type="range" className="w-full accent-red-500" />
                             <div className="flex justify-between text-xs text-gray-500 mt-1">
                                 <span>低压缩 (画质好)</span>
                                 <span>高压缩 (体积小)</span>
                             </div>
                        </div>
                    )}

                    <button 
                        onClick={processPDF}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        开始处理
                    </button>
                </div>
            )}

            {/* Progress Area */}
            {isProcessing && (
                <div className="text-center py-8 space-y-4">
                    <Loader2 size={32} className="animate-spin mx-auto text-red-500" />
                    <div className="w-full max-w-xs mx-auto">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>正在处理文档...</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Area */}
            {isDone && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">处理完成！</h3>
                    <p className="text-sm text-muted mb-6">您的文件已准备好下载</p>
                    
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
                        >
                            <Download size={18} /> 下载 PDF
                        </button>
                        <button onClick={() => { setIsDone(false); setFiles([]); }} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                            继续处理
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};