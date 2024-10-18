import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { supabase } = useAuth();
  const [stats, setStats] = useState({
    sites: 0,
    pages: 0,
    items: 0,
    clicks: 0,
    conversions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: sitesCount },
          { count: pagesCount },
          { count: itemsCount },
          { count: clicksCount },
          { count: conversionsCount },
        ] = await Promise.all([
          supabase.from('sites').select('*', { count: 'exact', head: true }),
          supabase.from('listicle_pages').select('*', { count: 'exact', head: true }),
          supabase.from('listicle_items').select('*', { count: 'exact', head: true }),
          supabase.from('link_clicks').select('*', { count: 'exact', head: true }),
          supabase.from('conversions').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          sites: sitesCount || 0,
          pages: pagesCount || 0,
          items: itemsCount || 0,
          clicks: clicksCount || 0,
          conversions: conversionsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [supabase]);

  const data = [
    { name: 'Sites', count: stats.sites },
    { name: 'Pages', count: stats.pages },
    { name: 'Items', count: stats.items },
    { name: 'Clicks', count: stats.clicks },
    { name: 'Conversions', count: stats.conversions },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-gray-100 text-3xl font-medium">Welcome to the Dashboard</h3>

      <div className="mt-4">
        <div className="flex flex-wrap -mx-6">
          {data.map((item) => (
            <div className="w-full px-6 sm:w-1/2 xl:w-1/5" key={item.name}>
              <div className="flex items-center px-5 py-6 bg-gray-800 rounded-md shadow-sm">
                <div className="p-3 rounded-full bg-blue-600 bg-opacity-75">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2 9.08889C18.2 11.5373 16.3196 13.5222 14 13.5222C11.6804 13.5222 9.79999 11.5373 9.79999 9.08889C9.79999 6.64043 11.6804 4.65556 14 4.65556C16.3196 4.65556 18.2 6.64043 18.2 9.08889Z" fill="currentColor"/>
                    <path d="M25.2 12.0444C25.2 13.6768 23.9464 15 22.4 15C20.8536 15 19.6 13.6768 19.6 12.0444C19.6 10.4121 20.8536 9.08889 22.4 9.08889C23.9464 9.08889 25.2 10.4121 25.2 12.0444Z" fill="currentColor"/>
                    <path d="M19.6 22.3889C19.6 19.1243 17.0927 16.4778 14 16.4778C10.9072 16.4778 8.39999 19.1243 8.39999 22.3889V26.8222H19.6V22.3889Z" fill="currentColor"/>
                    <path d="M8.39999 12.0444C8.39999 13.6768 7.14639 15 5.59999 15C4.05359 15 2.79999 13.6768 2.79999 12.0444C2.79999 10.4121 4.05359 9.08889 5.59999 9.08889C7.14639 9.08889 8.39999 10.4121 8.39999 12.0444Z" fill="currentColor"/>
                    <path d="M22.4 26.8222V22.3889C22.4 20.8312 22.0195 19.3671 21.351 18.0949C21.6863 18.0039 22.0378 17.9556 22.4 17.9556C24.7197 17.9556 26.6 19.9404 26.6 22.3889V26.8222H22.4Z" fill="currentColor"/>
                    <path d="M6.64896 18.0949C5.98058 19.3671 5.59999 20.8312 5.59999 22.3889V26.8222H1.39999V22.3889C1.39999 19.9404 3.2804 17.9556 5.59999 17.9556C5.96219 17.9556 6.31367 18.0039 6.64896 18.0949Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="mx-5">
                  <h4 className="text-2xl font-semibold text-gray-100">{item.count}</h4>
                  <div className="text-gray-400">{item.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-100 text-2xl font-medium">Overview</h3>
        </div>
        <div className="mt-4 bg-gray-800 rounded-md shadow-sm p-4" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;