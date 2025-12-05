import React, { useState, useEffect } from 'react';
import { 
  Code2, Braces, Terminal, Globe, Search, 
  Smartphone, Palette, Regex, ArrowLeft, Loader2, Copy, Check
} from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { generateRegexWithAI } from '../services/geminiService';

const devTools: Tool[] = [
  { id: 'json', name: 'JSON 格式化', description: '验证、美化和压缩 JSON 数据。', category: 'basic', icon: Braces, openSourceSolution: 'jsoneditor' },
  { id: 'ai-regex', name: 'AI 正则生成器', description: '说出需求，AI 帮你写复杂的正则表达式。', category: 'innovative', icon: Regex, openSourceSolution: 'Gemini API', isAiPowered: true },
  { id: 'color', name: '颜色提取', description: 'HEX, RGB, HSL 转换与调色板生成。', category: 'basic', icon: Palette, openSourceSolution: 'colord' },
  { id: 'ip', name: 'IP 查询', description: '查看本机 IP 及地理位置信息。', category: 'advanced', icon: Globe, openSourceSolution: 'ipapi' },
  { id: 'screenshot', name: '网页截图', description: '输入网址，一键生成长截图 (模拟)。', category: 'advanced', icon: Smartphone, openSourceSolution: 'puppeteer-core' },
  { id: 'source', name: '源码查看', description: '查看任意网页的 HTML/CSS 源码 (模拟)。', category: 'advanced', icon: Code2, openSourceSolution: 'view-source' },
];

const AIRegexTool = ({ onBack }: { onBack: () => void }) => {
  const [desc, setDesc] = useState('');
  const [result, setResult] = useState<{regex: string, flags: string, explanation: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateRegexWithAI(desc);
      setResult(data);
    } catch (e) {
      alert("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`/${result.regex}/${result.flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回开发者工具</span>
      </button>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Regex size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">AI 正则表达式生成器</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-medium text-muted">请描述您想匹配的内容</label>
             <textarea 
               value={desc}
               onChange={(e) => setDesc(e.target.value)}
               placeholder="例如：匹配所有qq邮箱地址，或者匹配以'https'开头且以'.com'结尾的网址..."
               className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 resize-none"
             />
          </div>

          <button
             onClick={handleGenerate}
             disabled={loading || !desc.trim()}
             className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
               loading || !desc.trim() ? 'bg-white/5 text-muted' : 'bg-accent text-black hover:bg-accent/90'
             }`}
          >
             {loading ? <Loader2 className="animate-spin" /> : <Terminal size={18} />}
             生成正则
          </button>

          {result && (
            <div className="animate-fadeIn mt-8 space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                  <span className="text-xs font-mono text-muted">REGEX OUTPUT</span>
                  <button onClick={handleCopy} className="text-muted hover:text-white transition-colors">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="p-6 font-mono text-xl text-green-400 break-all text-center">
                  /{result.regex}/{result.flags}
                </div>
              </div>
              
              <div className="bg-surface border border-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-2">解释：</h4>
                <p className="text-muted text-sm">{result.explanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Real implementations for DevTools
const BasicDevTool = ({ id, onBack }: { id: string, onBack: () => void }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id === 'ip') {
            setLoading(true);
            fetch('https://api.ipify.org?format=json')
                .then(r => r.json())
                .then(d => {
                    setOutput(`Current Public IP: ${d.ip}\n\n(Location lookup requires restricted GeoIP APIs, showing simplified info)`);
                })
                .catch(() => setOutput('Failed to fetch IP details. Please check your internet connection.'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const process = () => {
        setLoading(true);
        setTimeout(() => {
            if (id === 'json') {
                try {
                    const parsed = JSON.parse(input);
                    setOutput(JSON.stringify(parsed, null, 2));
                } catch (e: any) {
                    setOutput(`JSON Error:\n${e.message}`);
                }
            }
            else if (id === 'color') {
                 // Real Color Math
                 let hex = input.trim();
                 if (!hex.startsWith('#')) hex = '#' + hex;
                 
                 const isValidHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex);
                 
                 if(isValidHex) {
                     const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                     const r = parseInt(result![1], 16);
                     const g = parseInt(result![2], 16);
                     const b = parseInt(result![3], 16);

                     // RGB to HSL
                     const rN = r / 255, gN = g / 255, bN = b / 255;
                     const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
                     let h = 0, s = 0, l = (max + min) / 2;

                     if (max !== min) {
                         const d = max - min;
                         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                         switch (max) {
                             case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
                             case gN: h = (bN - rN) / d + 2; break;
                             case bN: h = (rN - gN) / d + 4; break;
                         }
                         h /= 6;
                     }

                     setOutput(
                         `HEX: ${hex.toUpperCase()}\n` + 
                         `RGB: rgb(${r}, ${g}, ${b})\n` + 
                         `HSL: hsl(${(h * 360).toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`
                     );
                 } else {
                     setOutput('Invalid HEX color. Format: #RRGGBB');
                 }
            }
            else if (id === 'screenshot') {
                 setOutput('[模拟结果] 截图任务已提交至队列。\n\n由于浏览器安全限制，纯前端无法直接截取外部网站。\n此功能通常需要 Puppeteer 后端服务支持。');
            }
            else if (id === 'source') {
                 setOutput('<html>\n  <!-- 演示数据 -->\n  <head>\n    <title>Sample Page</title>\n  </head>\n  <body>\n    <h1>Source Viewer Demo</h1>\n    <p>Real "View Source" requires a CORS proxy backend.</p>\n  </body>\n</html>');
            }
            setLoading(false);
        }, 300);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> <span>返回开发者工具</span>
            </button>
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                 <h2 className="text-xl font-bold text-white mb-4 uppercase flex items-center gap-2">
                    {id === 'json' && <Braces className="text-accent" />}
                    {id === 'color' && <Palette className="text-accent" />}
                    {id === 'ip' && <Globe className="text-accent" />}
                    {id.replace('-', ' ')}
                 </h2>
                 {id !== 'ip' && (
                     <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={id === 'json' ? 'Paste valid JSON here...' : id === 'color' ? '#6366f1' : 'https://example.com'}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 min-h-[120px] mb-4 font-mono text-sm leading-relaxed"
                     />
                 )}
                 {id !== 'ip' && (
                    <button onClick={process} disabled={loading || !input.trim()} className="w-full py-3 bg-accent text-black rounded-lg font-bold mb-6 flex justify-center hover:bg-accent/90 transition-colors">
                        {loading ? <Loader2 className="animate-spin"/> : 'Execute'}
                    </button>
                 )}
                 
                 <div className="relative">
                    <label className="absolute top-2 left-3 text-[10px] font-bold text-gray-500 uppercase">Output Result</label>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 pt-8 font-mono text-sm text-green-400 whitespace-pre-wrap break-words min-h-[100px]">
                        {loading ? <div className="flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Processing...</div> : output || <span className="text-gray-600 italic">Waiting for input...</span>}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export const DevTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (activeTool === 'ai-regex') return <AIRegexTool onBack={() => setActiveTool(null)} />;
  
  if (activeTool) return <BasicDevTool id={activeTool} onBack={() => setActiveTool(null)} />;

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">开发者工具</h1>
        <p className="text-lg text-muted">专为极客打造的格式化、网络调试与代码生成工具。</p>
      </div>

      <section>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};