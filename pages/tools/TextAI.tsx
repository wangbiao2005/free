import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Languages, FileText, CheckCheck, Eraser, Copy, Wand2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { processTextWithAI, TextAction } from '../../services/geminiService';

interface TextAIProps {
  onBack: () => void;
}

export const TextAI: React.FC<TextAIProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<TextAction>('summarize');

  const actions: { id: TextAction; label: string; icon: any }[] = [
    { id: 'summarize', label: '智能摘要', icon: FileText },
    { id: 'translate_en', label: '中译英', icon: Languages },
    { id: 'translate_zh', label: '英译中', icon: Languages },
    { id: 'polish', label: '文本润色', icon: Sparkles },
    { id: 'fix_grammar', label: '语法纠错', icon: CheckCheck },
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText(''); // Clear previous output
    try {
      const result = await processTextWithAI(inputText, activeAction);
      setOutputText(result);
    } catch (error) {
      setOutputText("处理请求时发生错误，请检查网络或稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    // Could add a toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>返回文档工具</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
          <Sparkles size={14} />
          AI 驱动
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-white/5 rounded-2xl p-4 flex-1 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-muted" />
                输入文本
              </h3>
              <div className="text-xs text-muted">
                {inputText.length} 字符
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此粘贴文章、段落或需要处理的文本内容..."
              className="flex-1 w-full bg-transparent border-0 focus:ring-0 text-gray-300 resize-none placeholder-white/10 p-2 text-base leading-relaxed scrollbar-thin"
            />
            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
              <button 
                onClick={() => setInputText('')}
                className="text-xs text-muted hover:text-white flex items-center gap-1 transition-colors"
              >
                <Eraser size={14} /> 清空
              </button>
              
              {/* Action Selector (Mobile/Tablet view mostly, but good for all) */}
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                {/* Actions are rendered below on desktop mostly, but let's keep it simple */}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-surface border border-white/5 rounded-xl p-2 flex flex-wrap gap-2 justify-center shadow-lg">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveAction(action.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeAction === action.id 
                    ? 'bg-white text-black shadow-md scale-105' 
                    : 'text-muted hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <action.icon size={16} />
                {action.label}
              </button>
            ))}
            <div className="w-px bg-white/10 mx-2 hidden sm:block"></div>
            <button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold ml-auto transition-all
                ${loading || !inputText.trim()
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                }
              `}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wand2 size={16} />
              )}
              开始执行
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col gap-4">
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-secondary" />
                AI 处理结果
              </h3>
              {outputText && (
                <button 
                  onClick={copyToClipboard}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors"
                >
                  <Copy size={12} /> 复制
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="animate-pulse">正在思考中...</p>
                </div>
              ) : outputText ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{outputText}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted/30">
                  <Wand2 size={48} className="mb-4" />
                  <p>选择一个功能并点击执行</p>
                </div>
              )}
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};