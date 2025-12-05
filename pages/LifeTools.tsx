import React, { useState } from 'react';
import { 
  QrCode, Calculator, Ruler, CircleDollarSign, 
  MessageSquare, Coffee, ArrowLeft, Send
} from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { askAIAssistant } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const lifeTools: Tool[] = [
  { id: 'ai-helper', name: 'AI 全能助手', description: '汇率换算、单位转换、生活百科问答。', category: 'innovative', icon: MessageSquare, openSourceSolution: 'Gemini', isAiPowered: true },
  { id: 'qrcode', name: '二维码生成', description: '生成带Logo的自定义二维码。', category: 'basic', icon: QrCode, openSourceSolution: 'qrcode.js' },
  { id: 'unit', name: '单位换算', description: '长度、重量、温度等物理单位转换。', category: 'basic', icon: Ruler, openSourceSolution: 'math.js' },
  { id: 'currency', name: '汇率计算', description: '实时汇率查询与货币转换。', category: 'basic', icon: CircleDollarSign, openSourceSolution: 'exchangerate-api' },
  { id: 'bmi', name: 'BMI 计算器', description: '身体质量指数计算与健康建议。', category: 'basic', icon: Calculator, openSourceSolution: 'Custom' },
];

const AIHelperTool = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: '你好！我是你的生活百宝箱助手。我可以帮你查汇率、换算单位，或者解答生活小常识。请问有什么可以帮你的？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const reply = await askAIAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: '抱歉，我现在无法回答，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
          <ArrowLeft size={18} /> <span>返回工具列表</span>
        </button>
      </div>

      <div className="flex-1 bg-surface border border-white/5 rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
           <MessageSquare size={20} className="text-primary" />
           <span className="font-bold text-white">AI 智能助手</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white/5 text-gray-200 rounded-bl-none'
              }`}>
                {msg.role === 'ai' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="问问我：100美元等于多少人民币？"
              className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Specialized Tools ---

const UnitConverter = ({ onBack }: { onBack: () => void }) => {
    const [val, setVal] = useState('1');
    const [from, setFrom] = useState('m');
    const [to, setTo] = useState('ft');
    const [result, setResult] = useState('');

    const calc = () => {
        const v = parseFloat(val);
        if(isNaN(v)) { setResult('Invalid Input'); return; }

        // Multipliers to base (meters, kg, celsius)
        const rates: any = {
            m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, mi: 1609.34, in: 0.0254,
            kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495
        };

        // Temperature is special
        if (['C', 'F', 'K'].includes(from) || ['C', 'F', 'K'].includes(to)) {
             let celsius = v;
             if (from === 'F') celsius = (v - 32) * 5/9;
             if (from === 'K') celsius = v - 273.15;
             
             let out = celsius;
             if (to === 'F') out = (celsius * 9/5) + 32;
             if (to === 'K') out = celsius + 273.15;
             setResult(`${out.toFixed(2)} ${to}`);
             return;
        }

        const base = v * rates[from];
        const out = base / rates[to];
        setResult(`${out.toFixed(4)} ${to}`);
    };

    return (
        <div className="max-w-xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"><ArrowLeft size={18}/> <span>Back</span></button>
            <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">单位换算</h2>
                <div className="flex gap-4 mb-4">
                    <input type="number" value={val} onChange={e=>setVal(e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white"/>
                    <select value={from} onChange={e=>setFrom(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white">
                        <optgroup label="Length">
                            <option value="m">Meters (m)</option>
                            <option value="km">Kilometers (km)</option>
                            <option value="ft">Feet (ft)</option>
                            <option value="mi">Miles (mi)</option>
                            <option value="in">Inches (in)</option>
                        </optgroup>
                        <optgroup label="Weight">
                            <option value="kg">Kilograms (kg)</option>
                            <option value="lb">Pounds (lb)</option>
                            <option value="oz">Ounces (oz)</option>
                        </optgroup>
                        <optgroup label="Temp">
                            <option value="C">Celsius (°C)</option>
                            <option value="F">Fahrenheit (°F)</option>
                            <option value="K">Kelvin (K)</option>
                        </optgroup>
                    </select>
                </div>
                <div className="text-center text-muted mb-4">to</div>
                <div className="flex gap-4 mb-6">
                    <select value={to} onChange={e=>setTo(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white">
                        <option value="m">Meters (m)</option>
                        <option value="ft">Feet (ft)</option>
                        <option value="km">Kilometers (km)</option>
                        <option value="mi">Miles (mi)</option>
                        <option value="in">Inches (in)</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="C">Celsius (°C)</option>
                        <option value="F">Fahrenheit (°F)</option>
                        <option value="K">Kelvin (K)</option>
                    </select>
                </div>
                <button onClick={calc} className="w-full py-3 bg-primary text-white rounded-lg font-bold">计算</button>
                {result && <div className="mt-6 text-center text-2xl font-mono text-green-400">{result}</div>}
            </div>
        </div>
    );
}

const CurrencyConverter = ({ onBack }: { onBack: () => void }) => {
    const [amount, setAmount] = useState('100');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('CNY');
    const [res, setRes] = useState('');

    const calc = () => {
        // Static rates relative to USD (Approximate)
        const rates: Record<string, number> = {
            USD: 1, CNY: 7.23, EUR: 0.92, JPY: 151.5, GBP: 0.79, AUD: 1.52, CAD: 1.36
        };
        const v = parseFloat(amount);
        const inUsd = v / rates[from];
        const out = inUsd * rates[to];
        setRes(`${out.toFixed(2)} ${to}`);
    };

    return (
        <div className="max-w-xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"><ArrowLeft size={18}/> <span>Back</span></button>
            <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
                 <h2 className="text-xl font-bold text-white mb-6">汇率计算器 (估算)</h2>
                 <div className="flex items-center gap-4 mb-6">
                     <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white"/>
                     <select value={from} onChange={e=>setFrom(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white">
                         {['USD','CNY','EUR','JPY','GBP','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                 </div>
                 <div className="flex items-center gap-4 mb-6">
                     <div className="flex-1 text-right text-gray-400">兑换为 -></div>
                     <select value={to} onChange={e=>setTo(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white w-24">
                         {['USD','CNY','EUR','JPY','GBP','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                 </div>
                 <button onClick={calc} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">转换</button>
                 {res && <div className="mt-6 text-center text-3xl font-mono text-green-400">{res}</div>}
                 <p className="text-xs text-center text-gray-500 mt-4">*汇率仅供参考，非实时银行牌价</p>
            </div>
        </div>
    );
}

const BasicLifeTool = ({ id, onBack }: { id: string, onBack: () => void }) => {
    const [val, setVal] = useState('');
    const [res, setRes] = useState('');

    const calc = () => {
        if (id === 'qrcode') {
            setRes(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(val)}`);
        } else if (id === 'bmi') {
            const [h, w] = val.split(/[,，\s]+/).map(Number);
            if (h && w) {
                const bmi = w / ((h/100) ** 2);
                let status = '正常';
                let color = 'text-green-400';
                if(bmi < 18.5) { status = '偏瘦'; color = 'text-yellow-400'; }
                else if(bmi >= 24) { status = '超重'; color = 'text-red-400'; }
                
                setRes(`BMI: ${bmi.toFixed(1)} | <span class="${color}">${status}</span>`);
            } else {
                setRes('输入格式错误。例：175 70');
            }
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> <span>返回</span>
            </button>
            <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl text-center">
                 <h2 className="text-xl font-bold text-white mb-6 uppercase">{id === 'bmi' ? 'BMI 计算器' : '二维码生成'}</h2>
                 <input 
                    value={val} 
                    onChange={e => setVal(e.target.value)} 
                    placeholder={id === 'bmi' ? "输入：身高(cm) 体重(kg) 例如: 175 70" : "输入网址或文本..."}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white mb-4"
                 />
                 <button onClick={calc} className="w-full py-3 bg-primary text-white rounded-lg font-bold mb-6">生成/计算</button>
                 
                 {id === 'qrcode' && res && (
                     <div className="flex justify-center p-4 bg-white rounded-xl mx-auto w-fit shadow-lg">
                         <img src={res} alt="QR" className="w-40 h-40" />
                     </div>
                 )}
                 {id !== 'qrcode' && res && <div className="text-xl font-mono" dangerouslySetInnerHTML={{__html: res}}></div>}
            </div>
        </div>
    );
}

export const LifeTools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (activeTool === 'ai-helper') return <AIHelperTool onBack={() => setActiveTool(null)} />;
  if (activeTool === 'unit') return <UnitConverter onBack={() => setActiveTool(null)} />;
  if (activeTool === 'currency') return <CurrencyConverter onBack={() => setActiveTool(null)} />;
  
  if (activeTool) return <BasicLifeTool id={activeTool} onBack={() => setActiveTool(null)} />;

  return (
    <div className="space-y-12 pb-10">
       <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">生活百宝箱</h1>
        <p className="text-lg text-muted">从单位换算到生活百科，AI 助您一臂之力。</p>
      </div>
      <section>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lifeTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};