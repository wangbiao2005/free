import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { Dashboard } from './pages/Dashboard';
import { VideoTools } from './pages/VideoTools';
import { AudioTools } from './pages/AudioTools';
import { TextTools } from './pages/TextTools';
import { ImageTools } from './pages/ImageTools';
import { DevTools } from './pages/DevTools';
import { LifeTools } from './pages/LifeTools';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/video" element={<VideoTools />} />
            <Route path="/audio" element={<AudioTools />} />
            <Route path="/image" element={<ImageTools />} />
            <Route path="/text" element={<TextTools />} />
            <Route path="/dev" element={<DevTools />} />
            <Route path="/life" element={<LifeTools />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
};

export default App;