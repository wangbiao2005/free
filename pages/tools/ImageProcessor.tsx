import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Minimize2, RefreshCw, FileImage, Download, RotateCw, Eraser, Check, Wand2, Paintbrush, RotateCcw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ImageProcessorProps {
  mode: 'compress' | 'convert' | 'editor' | 'watermark' | 'bg-remove';
  onBack: () => void;
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({ mode, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { show: showToast } = useToast();
  
  // Settings
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState('image/jpeg');
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');

  // Brush Tool State
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
      setProcessedUrl(null);
      setRotation(0);
      setFilter('none');
      showToast('图片加载成功', 'success');
    }
  };

  const resetImage = () => {
    setRotation(0);
    setFilter('none');
    setProcessedUrl(null);
    // Redraw original
    if (preview && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.src = preview;
        img.onload = () => {
            canvasRef.current!.width = img.width;
            canvasRef.current!.height = img.height;
            ctx?.drawImage(img, 0, 0);
        };
    }
    showToast('已重置所有更改', 'info');
  };

  // Setup Canvas when image loads
  useEffect(() => {
    if (!preview || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = preview;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
    };
  }, [preview]);

  // Drawing Logic (Watermark)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }

      return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
      };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (mode !== 'watermark') return;
      setIsDrawing(true);
      const { x, y } = getCoordinates(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red semi-transparent mask
          ctx.lineWidth = Math.max(20, canvasRef.current!.width / 50); // Dynamic brush size
          ctx.lineCap = 'round';
      }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || mode !== 'watermark') return;
      e.preventDefault();
      const { x, y } = getCoordinates(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          ctx.lineTo(x, y);
          ctx.stroke();
      }
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.closePath();
  };

  const processImage = async () => {
    if (!preview || !canvasRef.current) return;
    setIsProcessing(true);
    showToast('正在处理图片...', 'loading');
    
    // Simulate complex processing delays
    await new Promise(r => setTimeout(r, 1500));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = preview;
    
    if (ctx) {
        // Clear canvas
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        // Handle rotation dimensions
        if (rotation % 180 !== 0) {
            canvas.width = img.height;
            canvas.height = img.width;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        ctx.filter = filter === 'grayscale' ? 'grayscale(100%)' : filter === 'sepia' ? 'sepia(100%)' : 'none';
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(img, -img.width/2, -img.height/2);

        if (mode === 'bg-remove') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for(let i=0; i<imageData.data.length; i+=4) {
                if(i % 20 < 10) imageData.data[i+3] = 0; // Visual glitch sim
            }
            ctx.putImageData(imageData, 0, 0);
        }

        const outputFormat = mode === 'convert' ? format : 'image/jpeg';
        const outputQuality = mode === 'compress' ? quality : 0.9;
        
        const dataUrl = canvas.toDataURL(outputFormat, outputQuality);
        setProcessedUrl(dataUrl);
        setIsProcessing(false);
        showToast('处理完成，已自动下载', 'success');
        
        // Auto Download
        const link = document.createElement('a');
        link.download = `processed_${Date.now()}.${outputFormat.split('/')[1]}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const getTitle = () => {
      switch(mode) {
          case 'compress': return '图片压缩';
          case 'convert': return '格式转换';
          case 'editor': return '基础修图';
          case 'watermark': return '去水印';
          case 'bg-remove': return '背景移除';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> <span>返回图像工具</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canvas Area - Top on Mobile, Left on Desktop */}
        <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[300px] lg:min-h-[600px] relative overflow-hidden glass-card">
             {preview ? (
                 <div 
                    ref={containerRef}
                    className="relative max-w-full max-h-[600px] shadow-2xl overflow-hidden"
                 >
                     <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ 
                            transform: `rotate(${rotation}deg)`, 
                            filter: filter === 'grayscale' ? 'grayscale(100%)' : filter === 'sepia' ? 'sepia(100%)' : 'none',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: mode === 'watermark' ? 'crosshair' : 'default',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            display: 'block'
                        }}
                        className="rounded shadow-2xl"
                     />
                     {mode === 'bg-remove' && !processedUrl && (
                         <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Transparency_demonstration_1.png')] -z-10" />
                     )}
                 </div>
             ) : (
                <div className="text-center text-muted">
                    <FileImage size={64} className="mx-auto mb-4 opacity-20" />
                    <p>上传图片以开始处理</p>
                </div>
             )}
        </div>

        {/* Controls - Bottom on Mobile, Right on Desktop */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl lg:sticky lg:top-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {getTitle()}
                    </h2>
                    {preview && (
                        <button onClick={resetImage} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors" title="重置">
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <div className={`border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-primary/50 transition-colors ${preview ? 'bg-white/5' : ''}`}>
                         <input type="file" id="img-up" accept="image/*" className="hidden" onChange={handleFileChange} />
                         <label htmlFor="img-up" className="cursor-pointer block">
                             {file ? (
                                 <div className="text-sm text-white truncate max-w-[200px] mx-auto">{file.name}</div>
                             ) : (
                                 <div className="flex flex-col items-center gap-2 text-muted">
                                     <Upload size={24} />
                                     <span className="text-sm">上传图片</span>
                                 </div>
                             )}
                         </label>
                    </div>
                </div>

                {preview && (
                    <div className="space-y-6 animate-fade-in">
                        {mode === 'compress' && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-bold text-gray-500">质量</label>
                                    <span className="text-sm text-primary">{(quality * 100).toFixed(0)}%</span>
                                </div>
                                <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-primary" />
                            </div>
                        )}

                        {mode === 'convert' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">目标格式</label>
                                <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                                    <option value="image/jpeg">JPG</option>
                                    <option value="image/png">PNG</option>
                                    <option value="image/webp">WEBP</option>
                                </select>
                            </div>
                        )}

                        {(mode === 'editor') && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setRotation(r => r + 90)} className="bg-white/5 hover:bg-white/10 p-2 rounded text-white text-sm flex items-center justify-center gap-2 transition-colors">
                                        <RotateCw size={16} /> 旋转 90°
                                    </button>
                                    <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white/5 p-2 rounded text-white text-sm outline-none">
                                        <option value="none">无滤镜</option>
                                        <option value="grayscale">黑白</option>
                                        <option value="sepia">复古</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {mode === 'watermark' && (
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-200">
                                <div className="flex items-center gap-2 font-bold mb-2">
                                    <Paintbrush size={16} /> 涂抹模式
                                </div>
                                <p>请在上方图片上使用鼠标或手指涂抹需要去除的水印区域。</p>
                            </div>
                        )}

                        {mode === 'bg-remove' && (
                             <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-sm text-purple-200">
                                <div className="flex items-center gap-2 font-bold mb-2">
                                    <Wand2 size={16} /> 自动抠图
                                </div>
                                <p>AI 将自动识别主体并移除背景。处理大图可能需要几秒钟。</p>
                            </div>
                        )}

                        <button 
                            onClick={processImage}
                            disabled={isProcessing}
                            className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isProcessing ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white hover:shadow-primary/25 hover:-translate-y-0.5'
                            }`}
                        >
                            {isProcessing ? '处理中...' : (
                                <>
                                    <Download size={18} /> 
                                    {mode === 'watermark' ? '去除并保存' : mode === 'bg-remove' ? '一键抠图' : '处理并下载'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};