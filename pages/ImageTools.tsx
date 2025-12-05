import React, { useState } from 'react';
import { 
  Image as ImageIcon, Minimize2, RefreshCw, Eraser, 
  Wand2, Scan, FileImage, Upload, Eye, Loader2, ArrowLeft 
} from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { analyzeImageWithAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ImageProcessor } from './tools/ImageProcessor';

// Tools Data
const imageTools: Tool[] = [
  { id: 'compress', name: '图片压缩', description: '智能压缩 JPG/PNG，减小体积不降画质。', category: 'basic', icon: Minimize2, openSourceSolution: 'browser-image-compression' },
  { id: 'convert', name: '格式转换', description: 'WebP, PNG, JPG, HEIC 格式互转。', category: 'basic', icon: RefreshCw, openSourceSolution: 'HTML Canvas API' },
  { id: 'watermark', name: '去水印', description: '智能涂抹去除图片中的水印或瑕疵。', category: 'advanced', icon: Eraser, openSourceSolution: 'OpenCV.js' },
  { id: 'editor', name: '基础修图', description: '裁剪、旋转、滤镜和色彩调整。', category: 'basic', icon: FileImage, openSourceSolution: 'react-image-editor' },
  { id: 'ai-vision', name: 'AI 智能识图', description: '识别图片内容，提取文字，分析场景。', category: 'innovative', icon: Eye, openSourceSolution: 'Gemini Vision', isAiPowered: true },
  { id: 'bg-remove', name: '背景移除', description: '一键自动扣除人物或物体背景。', category: 'innovative', icon: Wand2, openSourceSolution: 'imgly-background-removal' },
];

// AI Vision Component (Inline for now as it's simple)
const AIVisionTool = ({ onBack }: { onBack: () => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const analysis = await analyzeImageWithAI(selectedImage, mimeType, prompt);
      setResult(analysis);
    } catch (error) {
      setResult("分析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回图像工具</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
             <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
               <Eye className="text-primary" /> AI 智能识图
             </h2>
             
             <div className="relative group border-2 border-dashed border-white/10 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center bg-black/20 hover:border-primary/50 transition-colors">
               {selectedImage ? (
                 <img src={selectedImage} alt="Preview" className="w-full h-full object-contain max-h-[400px]" />
               ) : (
                 <div className="text-center p-6">
                   <Upload size={40} className="mx-auto text-muted mb-4" />
                   <p className="text-muted">点击或拖拽上传图片</p>
                 </div>
               )}
               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
           </div>

           <div className="space-y-3">
             <label className="text-sm font-medium text-muted">想问 AI 什么？(可选)</label>
             <input 
               type="text" 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="例如：这张图片里有什么？提取图中的文字..."
               className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50"
             />
             <button
                onClick={handleAnalyze}
                disabled={!selectedImage || loading}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !selectedImage || loading ? 'bg-white/5 text-muted' : 'bg-primary text-white hover:bg-primary/90'
                }`}
             >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                开始分析
             </button>
           </div>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-6 h-full min-h-[400px] flex flex-col">
          <h3 className="font-semibold text-white mb-4">分析结果</h3>
          <div className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none scrollbar-thin">
            {result ? (
              <ReactMarkdown>{result}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted/30">
                <Scan size={48} className="mb-4" />
                <p>等待分析...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderActiveTool = () => {
      switch(activeTool) {
          case 'ai-vision': return <AIVisionTool onBack={() => setActiveTool(null)} />;
          case 'compress': 
          case 'convert': 
          case 'editor':
          case 'watermark':
              return <ImageProcessor mode={activeTool as any} onBack={() => setActiveTool(null)} />;
          default: return null;
      }
  };

  if (activeTool) {
      const component = renderActiveTool();
      if (component) return component;

      // Fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4">
             <Wand2 size={40} className="text-muted" />
          </div>
          <h2 className="text-3xl font-bold text-white">正在建设中</h2>
          <button onClick={() => setActiveTool(null)} className="px-6 py-2 rounded-lg bg-surface border border-white/10 hover:bg-white/5 transition-colors">返回列表</button>
        </div>
      );
  }

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">图像实验室</h1>
        <p className="text-lg text-muted">像素级处理能力，结合最先进的 AI 视觉模型。</p>
      </div>

      <section>
         <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">图像工具</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};