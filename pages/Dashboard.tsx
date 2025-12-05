import React, { useEffect, useState } from 'react';
import { 
  Activity, Video, Music, Image as ImageIcon, FileText, 
  Zap, ArrowRight, Sparkles, Cpu, HardDrive, Clock, Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="glass-card rounded-2xl p-6 flex items-center gap-5 hover:bg-white/5 transition-colors group">
    <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
      <Icon size={26} />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">{trend}</span>
      </div>
    </div>
  </div>
);

const QuickLink = ({ to, title, desc, icon: Icon, color }: any) => (
  <Link 
    to={to}
    className="group relative overflow-hidden glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/10"
  >
    <div className={`absolute top-0 right-0 p-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-${color}-500/10`} />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        {title} <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-400" />
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </Link>
);

export const Dashboard = () => {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');
  const [quote, setQuote] = useState({ text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" });

  useEffect(() => {
    const key = localStorage.getItem('deepseek_api_key') || process.env.API_KEY;
    setApiKeySet(!!key);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Fetch Quote if Key exists
    if (key) {
        const fetchQuote = async () => {
            try {
                // Direct DeepSeek Call for Quote
                const response = await fetch("https://api.deepseek.com/chat/completions", {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                  },
                  body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                      { role: "system", content: "Generate a short, inspiring quote for a developer. Output JSON: { \"text\": \"...\", \"author\": \"...\" }." },
                      { role: "user", content: "Quote please." }
                    ],
                    stream: false,
                    response_format: { type: "json_object" }
                  })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = JSON.parse(data.choices[0]?.message?.content || '{}');
                    if (content.text) setQuote(content);
                }
            } catch (e) {
                // Fallback silently to static
            }
        };
        fetchQuote();
    }
  }, []);

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in pb-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 p-6 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900/50 to-black z-0"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 z-0 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-secondary/20 rounded-full blur-[80px] animate-pulse-slow animate-delay-200"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-200 mb-6 backdrop-blur-md">
            <Sparkles size={12} className="text-secondary" />
            <span>v2.0 Release (DeepSeek AI)</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            {greeting}, Creator. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              您的终极创意工坊
            </span>
          </h1>
          
          {/* Daily Quote Section */}
          <div className="mb-8 p-4 bg-white/5 rounded-xl border-l-4 border-secondary backdrop-blur-sm max-w-lg">
             <div className="flex gap-2 text-indigo-200 italic font-serif">
                <Quote size={16} className="flex-shrink-0 -mt-1" />
                <p className="text-sm">"{quote.text}"</p>
             </div>
             <p className="text-right text-xs text-gray-400 mt-2">— {quote.author}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/video" className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10 flex items-center gap-2 text-sm md:text-base">
              开始创作 <ArrowRight size={18} />
            </Link>
            {!apiKeySet && (
              <Link to="/settings" className="px-6 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-md flex items-center gap-2 text-sm md:text-base">
                配置 AI 密钥 <Zap size={18} className="text-yellow-400" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Video} label="视频工具" value="12" trend="+3 New" color="indigo" />
        <StatCard icon={Music} label="音频模块" value="8" trend="Stable" color="pink" />
        <StatCard icon={FileText} label="文档处理" value="10" trend="Updated" color="green" />
        <StatCard icon={Cpu} label="AI 模型" value="DeepSeek" trend="V3" color="blue" />
      </div>

      {/* Quick Access */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
            <h2 className="text-xl font-semibold text-white">热门工具入口</h2>
          </div>
          <span className="text-xs text-muted font-mono flex items-center gap-1">
            <Clock size={12} /> SYSTEM READY
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up animate-delay-100">
          <QuickLink 
            to="/video" 
            title="视频工作室" 
            desc="剪辑、合并、压缩与 AI 摘要" 
            icon={Video} 
            color="indigo" 
          />
          <QuickLink 
            to="/audio" 
            title="音频大师" 
            desc="格式转换、人声分离与 TTS" 
            icon={Music} 
            color="pink" 
          />
          <QuickLink 
            to="/image" 
            title="图像实验室" 
            desc="AI 识图、去水印与修图" 
            icon={ImageIcon} 
            color="blue" 
          />
          <QuickLink 
            to="/text" 
            title="文档工具" 
            desc="PDF 处理与 OCR 识别" 
            icon={FileText} 
            color="green" 
          />
          <QuickLink 
            to="/life" 
            title="生活百宝箱" 
            desc="AI 助手与实用计算器" 
            icon={Zap} 
            color="yellow" 
          />
          <QuickLink 
            to="/settings" 
            title="系统设置" 
            desc="管理 API Key 与数据隐私" 
            icon={HardDrive} 
            color="gray" 
          />
        </div>
      </section>

      {/* Footer info */}
      <div className="text-center pt-10 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-2 text-muted text-sm mb-2">
            <Activity size={14} className="text-green-500 animate-pulse" />
            <span>Operational Status: Normal</span>
        </div>
        <p className="text-xs text-gray-600">
            © 2024 Free Toolkit. Built with ❤️ for Creators.
        </p>
      </div>
    </div>
  );
};