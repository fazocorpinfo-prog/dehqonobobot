import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initTelegram } from './telegram';
import { api } from './api';
import Layout from './components/Layout';
import Home from './pages/Home';
import Garden from './pages/Garden';
import Leaderboard from './pages/Leaderboard';
import Announcements from './pages/Announcements';
import Challenges from './pages/Challenges';
import PrayerTimes from './pages/PrayerTimes';
import Articles from './pages/Articles';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminKhatms from './admin/Khatms';
import AdminUsers from './admin/Users';
import AdminContent from './admin/Content';
import AdminPrayerTimes from './admin/AdminPrayerTimes';

export default function App() {
  const [user, setUser] = useState<any | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    initTelegram();
    api
      .me()
      .then((r) => {
        setUser(r.user);
        setIsAdmin(!!r.isAdmin);
      })
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-700 animate-pulse">Yuklanyapti...</div>
      </div>
    );
  }

  if (user === null) {
    return <Register onRegistered={(u) => setUser(u)} />;
  }

  return (
    <Routes>
      <Route element={<Layout user={user} isAdmin={isAdmin} />}>
        <Route path="/" element={<Home />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/prayer" element={<PrayerTimes />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/profile" element={<Profile user={user} />} />
      </Route>
      {isAdmin && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="khatms" element={<AdminKhatms />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="prayer" element={<AdminPrayerTimes />} />
        </Route>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
