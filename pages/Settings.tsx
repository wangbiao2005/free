import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Palette, Database, Info, Save, Trash2, CheckCircle2, Eye, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [theme, setTheme] = useState('indigo');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    // Load saved settings
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('deepseek_api_key', apiKey.trim());
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleClearData = () => {
    if (confirm("确定要清除所有本地缓存吗？这将重置所有的设置和历史记录。")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const colors = [
      { id: 'indigo', hex: '#6366f1', name: 'Indigo (Default)' },
      { id: 'blue', hex: '#3b82f6', name: 'Ocean Blue' },
      { id: 'purple', hex: '#a855f7', name: 'Purple Rain' },
      { id: 'emerald', hex: '#10b981', name: 'Emerald' },
      { id: 'rose', hex: '#f43f5e', name: 'Rose Red' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <SettingsIcon size={36} className="text-muted" /> 设置
        </h1>
        <p className="text-lg text-muted">管理 API 密钥、个性化选项和数据隐私。</p>
      </div>

      <div className="space-y-8">
        
        {/* API Key Section */}
        <section className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                    <Key size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">DeepSeek API 配置</h2>
                    <p className="text-sm text-muted">所有 AI 功能将使用 DeepSeek 模型 (deepseek-chat)</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-100">
                        <p className="mb-2">您的 API Key 仅存储在浏览器的 <strong>localStorage</strong> 中，绝不会发送到我们的服务器。所有请求直接从您的浏览器发送至 DeepSeek API。</p>
                        <a 
                            href="https://platform.deepseek.com/api_keys" 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                            获取 DeepSeek API Key <ExternalLink size={12} />
                        </a>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase">API Key</label>
                    <div className="relative">
                        <input 
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pr-24 text-white focus:outline-none focus:border-primary/50 font-mono"
                        />
                        <button 
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button 
                        onClick={handleSaveKey}
                        className={`
                            px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                            ${saveStatus === 'success' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-primary hover:bg-primary/90 text-white'
                            }
                        `}
                    >
                        {saveStatus === 'success' ? (
                            <><CheckCircle2 size={18} /> 已保存</>
                        ) : (
                            <><Save size={18} /> 保存配置</>
                        )}
                    </button>
                </div>
            </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Palette size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">外观与主题</h2>
                    <p className="text-sm text-muted">自定义界面风格 (演示)</p>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 uppercase">强调色</label>
                <div className="flex flex-wrap gap-4">
                    {colors.map(c => (
                        <button 
                            key={c.id}
                            onClick={() => {
                                setTheme(c.id);
                                localStorage.setItem('app_theme', c.id);
                            }}
                            className={`
                                flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
                                ${theme === c.id ? 'bg-white/10 border-white text-white' : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'}
                            `}
                        >
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: c.hex }} />
                            <span className="text-sm font-medium">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* Data Management */}
        <section className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <Database size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">数据管理</h2>
                    <p className="text-sm text-muted">清理缓存与重置应用</p>
                </div>
            </div>

            <div className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                <div className="space-y-1">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400" /> 危除区域
                    </h3>
                    <p className="text-sm text-gray-400">这将清除所有本地存储的配置、历史记录和缓存文件。</p>
                </div>
                <button 
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                >
                    <Trash2 size={16} /> 清除所有数据
                </button>
            </div>
        </section>

        {/* About */}
        <div className="text-center pt-8 text-gray-500 text-sm">
            <p className="mb-2">Free Tool Suite v2.0.0</p>
            <p>Built with React & DeepSeek AI.</p>
        </div>

      </div>
    </div>
  );
};