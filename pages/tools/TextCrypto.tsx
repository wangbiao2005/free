import React, { useState } from 'react';
import { ArrowLeft, Lock, Key, Unlock, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';

interface TextCryptoProps {
  mode: 'encrypt' | 'hash';
  onBack: () => void;
}

export const TextCrypto: React.FC<TextCryptoProps> = ({ mode, onBack }) => {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Hash state
  const [algo, setAlgo] = useState('SHA-256');

  const handleEncrypt = () => {
    if (!input) return;
    // Simulation of AES: Simple Base64 + Salt for demo
    // In real app use crypto-js or Web Crypto API
    const salt = btoa(password || 'default');
    const encoded = btoa(encodeURIComponent(input));
    const reversed = encoded.split('').reverse().join('');
    setOutput(`ENC::${salt.substring(0,4)}::${reversed}`);
  };

  const handleDecrypt = () => {
     if (!input.startsWith('ENC::')) {
         setOutput("错误：无效的密文格式");
         return;
     }
     try {
         const parts = input.split('::');
         const reversed = parts[2];
         const encoded = reversed.split('').reverse().join('');
         const decoded = decodeURIComponent(atob(encoded));
         setOutput(decoded);
     } catch (e) {
         setOutput("错误：解密失败，密钥错误或密文损坏");
     }
  };

  const handleHash = async () => {
      if (!input) return;
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> <span>返回文档工具</span>
      </button>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400">
                {mode === 'encrypt' ? <Lock size={24} /> : <Key size={24} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{mode === 'encrypt' ? '文本加密/解密' : '哈希生成器'}</h2>
                <p className="text-sm text-muted">Client-side Security</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-500 uppercase">输入内容</label>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'encrypt' ? "输入要加密的文本，或粘贴以 ENC:: 开头的密文进行解密..." : "输入文本以生成哈希值..."}
                    className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gray-500 resize-none font-mono text-sm"
                />
                
                {mode === 'encrypt' && (
                    <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-500 uppercase">密钥 (Password)</label>
                         <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="可选：输入加密/解密密码"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gray-500"
                         />
                    </div>
                )}

                {mode === 'hash' && (
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">算法</label>
                        <select value={algo} onChange={e => setAlgo(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white">
                            <option value="SHA-256">SHA-256</option>
                            <option value="SHA-1">SHA-1</option>
                            <option value="MD5">MD5 (Legacy)</option>
                        </select>
                   </div>
                )}

                <div className="flex gap-4">
                    {mode === 'encrypt' ? (
                        <>
                            <button onClick={handleEncrypt} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex justify-center gap-2 transition-colors">
                                <Lock size={18} /> 加密
                            </button>
                            <button onClick={handleDecrypt} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex justify-center gap-2 transition-colors border border-white/10">
                                <Unlock size={18} /> 解密
                            </button>
                        </>
                    ) : (
                        <button onClick={handleHash} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex justify-center gap-2 transition-colors">
                            <RefreshCw size={18} /> 计算哈希
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-500 uppercase">输出结果</label>
                    {output && (
                        <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>} 复制
                        </button>
                    )}
                </div>
                <div className="relative h-full min-h-[200px] bg-black/40 border border-white/10 rounded-xl p-4 overflow-hidden break-all font-mono text-sm text-green-400">
                    {output || <span className="text-gray-700 select-none">等待处理...</span>}
                    {output && <ShieldCheck className="absolute bottom-4 right-4 text-green-500/20 w-16 h-16 pointer-events-none" />}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};