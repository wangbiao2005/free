import React from 'react';
import { ArrowRight, Code2, Sparkles } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;
  
  return (
    <div 
      onClick={onClick}
      className="group relative glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
    >
      {/* Spotlight Effect Gradient */}
      <div className="absolute -inset-px bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-lg" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-5">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner
            ${tool.category === 'innovative' 
              ? 'bg-gradient-to-br from-secondary/20 to-pink-600/20 text-secondary border border-secondary/20 group-hover:scale-110'
              : 'bg-white/5 text-gray-400 border border-white/5 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20'
            }
          `}>
            <Icon size={28} />
          </div>
          
          {tool.isAiPowered && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-secondary/10 to-purple-500/10 text-secondary text-[10px] font-bold uppercase tracking-wider border border-secondary/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
              <Sparkles size={10} className="animate-pulse" /> AI Pro
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors tracking-tight">
          {tool.name}
        </h3>
        
        <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-black/30 px-2 py-1 rounded-md border border-white/5">
            <Code2 size={10} />
            <span className="font-mono">{tool.openSourceSolution}</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transform transition-all duration-300 group-hover:bg-primary group-hover:rotate-[-45deg]">
            <ArrowRight size={14} className="text-gray-400 group-hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};