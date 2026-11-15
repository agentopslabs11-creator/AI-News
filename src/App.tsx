import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { LatestNews } from './pages/LatestNews';
import { EnglishEdition } from './pages/EnglishEdition';
import { TeluguEdition } from './pages/TeluguEdition';
import { HindiEdition } from './pages/HindiEdition';
import { EpaperReader } from './pages/EpaperReader';
import { Videos } from './pages/Videos';
import { Archive } from './pages/Archive';
import { About } from './pages/About';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { UploadEdition } from './pages/UploadEdition';
import { ManageEditions } from './pages/ManageEditions';
import { ManageArticles } from './pages/ManageArticles';
import { ManageCategories } from './pages/ManageCategories';
import { ManageVideos } from './pages/ManageVideos';
import { ManageAds } from './pages/ManageAds';
import { AdminSettings } from './pages/AdminSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Newspaper Portal */}
          <Route path="/" element={<Home />} />
          <Route path="/latest-news" element={<LatestNews />} />
          <Route path="/english" element={<EnglishEdition />} />
          <Route path="/telugu" element={<TeluguEdition />} />
          <Route path="/hindi" element={<HindiEdition />} />
          <Route path="/epaper" element={<EpaperReader />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Administration Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upload" element={<UploadEdition />} />
            <Route path="editions" element={<ManageEditions />} />
            <Route path="articles" element={<ManageArticles />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="videos" element={<ManageVideos />} />
            <Route path="ads" element={<ManageAds />} />
            <Route path="archive" element={<Archive />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
