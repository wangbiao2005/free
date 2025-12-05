import React, { useState } from 'react';
import { 
  FileText, Files, FileType, Lock, Key, 
  Languages, ScanText, Calculator, Image,
  Scissors, Minimize2, ArrowRightLeft, Wand2
} from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { TextAI } from './tools/TextAI';
import { TextOCR } from './tools/TextOCR';
import { TextPDF } from './tools/TextPDF';
import { TextCrypto } from './tools/TextCrypto';

// Data for all available text/doc tools
const textTools: Tool[] = [
  // PDF Tools
  { id: 'pdf-merge', name: 'PDF 合并', description: '将多个 PDF 文档合并为一个文件。', category: 'basic', icon: Files, openSourceSolution: 'pdf-lib' },
  { id: 'pdf-split', name: 'PDF 分割', description: '提取指定页面或将文档拆分为多份。', category: 'basic', icon: Scissors, openSourceSolution: 'pdf-lib' },
  { id: 'pdf-compress', name: 'PDF 压缩', description: '优化文件大小，适合网络传输。', category: 'basic', icon: Minimize2, openSourceSolution: 'pdf-lib' },
  { id: 'img-to-pdf', name: '图片转 PDF', description: '将 JPG/PNG 图片打包成 PDF 文档。', category: 'basic', icon: Image, openSourceSolution: 'jsPDF' },

  // AI & Text Analysis
  { id: 'ai-lab', name: 'AI 文本实验室', description: '智能翻译、摘要、润色与语法纠错。', category: 'innovative', icon: Wand2, openSourceSolution: 'Gemini API', isAiPowered: true },
  { id: 'ocr', name: 'OCR 文字识别', description: '从图片中提取可编辑的文本内容。', category: 'innovative', icon: ScanText, openSourceSolution: 'tesseract.js' },
  
  // Format Conversion (Placeholder for demo simplicity, can reuse logic)
  { id: 'file-type', name: '格式工厂', description: '全能文本文件编码与格式转换。', category: 'basic', icon: FileType, openSourceSolution: 'Custom' },

  // Security
  { id: 'encrypt', name: '文本加密', description: '使用 AES 标准加密敏感文本信息。', category: 'advanced', icon: Lock, openSourceSolution: 'crypto-js' },
  { id: 'hash', name: '哈希生成', description: '生成 MD5, SHA-1, SHA-256 校验码。', category: 'advanced', icon: Key, openSourceSolution: 'crypto-js' },
];

export const TextTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
  };

  const renderActiveTool = () => {
    switch (activeTool) {
        case 'ai-lab':
            return <TextAI onBack={() => setActiveTool(null)} />;
        case 'ocr':
            return <TextOCR onBack={() => setActiveTool(null)} />;
        case 'pdf-merge':
            return <TextPDF mode="merge" onBack={() => setActiveTool(null)} />;
        case 'pdf-split':
            return <TextPDF mode="split" onBack={() => setActiveTool(null)} />;
        case 'pdf-compress':
            return <TextPDF mode="compress" onBack={() => setActiveTool(null)} />;
        case 'img-to-pdf':
            return <TextPDF mode="img-to" onBack={() => setActiveTool(null)} />;
        case 'encrypt':
            return <TextCrypto mode="encrypt" onBack={() => setActiveTool(null)} />;
        case 'hash':
            return <TextCrypto mode="hash" onBack={() => setActiveTool(null)} />;
        default:
            return null;
    }
  };

  if (activeTool && ['ai-lab', 'ocr', 'pdf-merge', 'pdf-split', 'pdf-compress', 'img-to-pdf', 'encrypt', 'hash'].includes(activeTool)) {
    return renderActiveTool();
  }

  // Fallback for tools not yet fully implemented
  if (activeTool) {
      const tool = textTools.find(t => t.id === activeTool);
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4">
             {tool && <tool.icon size={40} className="text-muted" />}
          </div>
          <h2 className="text-3xl font-bold text-white">正在建设中</h2>
          <p className="text-muted max-w-md">
            <span className="text-primary font-bold">{tool?.name}</span> 功能即将上线。
          </p>
          <button 
            onClick={() => setActiveTool(null)}
            className="px-6 py-2 rounded-lg bg-surface border border-white/10 hover:bg-white/5 transition-colors"
          >
            返回列表
          </button>
        </div>
      );
  }

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">文档与文本</h1>
        <p className="text-lg text-muted">高效的 PDF 处理、格式转换与 AI 辅助写作工具。</p>
      </div>

      {/* PDF Tools */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-red-500 rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">PDF 工具箱</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {textTools.filter(t => t.id.includes('pdf') || t.id.includes('img-to')).map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>

      {/* AI & Analysis */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">AI 与分析</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textTools.filter(t => t.category === 'innovative' || t.id === 'word-count').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>

      {/* Format & Security */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gray-500 rounded-full"></div>
          <h2 className="text-xl font-semibold text-white">格式与安全</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {textTools.filter(t => (t.category === 'advanced' || t.category === 'basic') && !t.id.includes('pdf') && !t.id.includes('img-to') && t.id !== 'word-count').map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};