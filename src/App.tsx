import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Sites from './components/Sites';
import ListiclePages from './components/ListiclePages';
import ListicleItems from './components/ListicleItems';
import ShortLinks from './components/ShortLinks';
import Analytics from './components/Analytics';
import Users from './components/Users';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Login from './components/Login';
import Layout from './components/Layout';
import ShortLinkRedirect from './components/ShortLinkRedirect';

const App: React.FC = () => {
  const { user, supabase } = useAuth();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
    };
    checkUser();
  }, [supabase]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
        <Route path="/go/:shortCode" element={<ShortLinkRedirect />} />
        <Route
          path="/admin/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="sites" element={<Sites />} />
                  <Route path="pages" element={<ListiclePages />} />
                  <Route path="items" element={<ListicleItems />} />
                  <Route path="short-links" element={<ShortLinks />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;