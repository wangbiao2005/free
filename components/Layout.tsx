import React, { useState } from 'react';
import { Menu, X, Video, Music, Image as ImageIcon, FileText, Settings, Zap, Code2, Coffee, Home, ChevronRight, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
      active 
        ? 'text-white font-medium bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/10 shadow-lg shadow-primary/5' 
        : 'text-muted hover:text-white hover:bg-white/5'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
    <Icon size={20} className={`transition-colors duration-300 ${active ? 'text-primary' : 'text-muted group-hover:text-white'}`} />
    <span>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto text-primary/50" />}
  </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile, logic handles desktop
  const location = useLocation();

  // Helper to get current section name
  const getSectionName = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return '首页仪表盘';
    const map: Record<string, string> = {
      video: '视频工作室', audio: '音频大师', image: '图像实验室',
      text: '文档与文本', dev: '开发者工具', life: '生活百宝箱', settings: '设置'
    };
    return map[path] || '工具箱';
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 glass border-r border-white/5 transform transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 pb-2 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 px-2" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-secondary flex items-center justify-center shadow-xl shadow-primary/20 ring-1 ring-white/10">
              <Zap className="text-white" size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Free Toolkit
              </h1>
              <p className="text-[10px] text-primary tracking-widest font-bold uppercase">Ultimate Suite</p>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto scrollbar-thin pb-4" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>
          <NavItem to="/" icon={Home} label="首页仪表盘" active={location.pathname === '/'} />

          <div className="mt-8 mb-2 px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Creative</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          <NavItem to="/video" icon={Video} label="视频工作室" active={location.pathname.startsWith('/video')} />
          <NavItem to="/audio" icon={Music} label="音频大师" active={location.pathname.startsWith('/audio')} />
          <NavItem to="/image" icon={ImageIcon} label="图像实验室" active={location.pathname.startsWith('/image')} />
          
          <div className="mt-8 mb-2 px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Productivity</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          <NavItem to="/text" icon={FileText} label="文档与文本" active={location.pathname.startsWith('/text')} />
          <NavItem to="/dev" icon={Code2} label="开发者工具" active={location.pathname.startsWith('/dev')} />
          <NavItem to="/life" icon={Coffee} label="生活百宝箱" active={location.pathname.startsWith('/life')} />
          
          <div className="mt-8"></div>
          <NavItem to="/settings" icon={Settings} label="设置" active={location.pathname === '/settings'} />
        </nav>
        
        {/* User Profile Snippet */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center">
              <User size={14} className="text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Local User</p>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online
              </p>
            </div>
            <Link to="/settings" className="p-1.5 text-gray-500 hover:text-white transition-colors">
              <Settings size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-50">
        <header className="h-16 border-b border-white/5 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-muted hover:text-white active:scale-95 transition-transform">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted hidden sm:inline">App</span>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <span className="text-white font-medium">{getSectionName()}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth" id="main-scroll">
          <div className="max-w-7xl mx-auto w-full animate-fade-in-up pb-20 lg:pb-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};