import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, List, Link as LinkIcon, PieChart, Users, Settings, User, LogOut } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <nav className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">VPN Admin</h1>
        </div>
        <ul className="mt-4">
          <NavItem to="/admin" icon={<Home />} text="Dashboard" />
          <NavItem to="/admin/sites" icon={<FileText />} text="Sites" />
          <NavItem to="/admin/pages" icon={<List />} text="Listicle Pages" />
          <NavItem to="/admin/items" icon={<List />} text="Listicle Items" />
          <NavItem to="/admin/short-links" icon={<LinkIcon />} text="Short Links" />
          <NavItem to="/admin/analytics" icon={<PieChart />} text="Analytics" />
          <NavItem to="/admin/users" icon={<Users />} text="Users" />
          <NavItem to="/admin/settings" icon={<Settings />} text="Settings" />
          <NavItem to="/admin/profile" icon={<User />} text="Profile" />
        </ul>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center text-red-500 hover:text-red-400"
          >
            <LogOut className="mr-2" size={20} />
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 text-white">
        {children}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; text: string }> = ({ to, icon, text }) => (
  <li className="mb-2">
    <Link
      to={to}
      className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
    >
      {icon}
      <span className="ml-2">{text}</span>
    </Link>
  </li>
);

export default Layout;