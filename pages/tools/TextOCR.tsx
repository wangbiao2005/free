import React, { useState } from 'react';
import { ArrowLeft, Upload, ScanText, Copy, Check, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeImageWithAI } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TextOCRProps {
  onBack: () => void;
}

export const TextOCR: React.FC<TextOCRProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
      setResult('');
    }
  };

  const handleExtract = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      // Use a specific prompt for OCR
      const ocrPrompt = "请识别并提取这张图片中的所有文字。保持原有的段落结构。不要添加任何解释性文字，只输出提取的内容。";
      const text = await analyzeImageWithAI(selectedImage, mimeType, ocrPrompt);
      setResult(text);
    } catch (error) {
      setResult("识别失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ocr_result_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
          <ArrowLeft size={18} /> <span>返回文档工具</span>
        </button>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
        {/* Left: Upload & Preview */}
        <div className="flex flex-col gap-4">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                 <ScanText size={24} />
               </div>
               <h2 className="text-xl font-bold text-white">智能 OCR 文字识别</h2>
             </div>

             <div className="flex-1 relative group border-2 border-dashed border-white/10 rounded-xl overflow-hidden flex items-center justify-center bg-black/20 hover:border-blue-500/50 transition-colors min-h-[300px]">
               {selectedImage ? (
                 <img src={selectedImage} alt="Preview" className="w-full h-full object-contain p-4" />
               ) : (
                 <div className="text-center p-6">
                   <Upload size={40} className="mx-auto text-muted mb-4" />
                   <p className="text-muted">点击或拖拽上传图片 (JPG, PNG)</p>
                 </div>
               )}
               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>

             <button
                onClick={handleExtract}
                disabled={!selectedImage || loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 transition-all ${
                  !selectedImage || loading ? 'bg-white/5 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'
                }`}
             >
                {loading ? <Loader2 className="animate-spin" /> : <ScanText size={18} />}
                开始识别
             </button>
           </div>
        </div>

        {/* Right: Result */}
        <div className="flex flex-col gap-4">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 h-full flex flex-col shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FileText size={18} /> 识别结果
                    </h3>
                    {result && (
                        <div className="flex gap-2">
                            <button onClick={handleCopy} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-2">
                                {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>} 复制
                            </button>
                            <button onClick={handleDownload} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors">
                                导出 TXT
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 overflow-y-auto scrollbar-thin">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-400">AI</div>
                            </div>
                            <p className="text-muted animate-pulse">正在提取文字...</p>
                        </div>
                    ) : result ? (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                            {result}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted/30">
                            <ImageIcon size={48} className="mb-4" />
                            <p>上传图片后点击开始识别</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};