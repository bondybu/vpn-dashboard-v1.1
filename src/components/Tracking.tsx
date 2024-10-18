import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Tracking = () => {
  const [shortLinks, setShortLinks] = useState([]);
  const [clickData, setClickData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShortLinks();
    fetchClickData();
  }, []);

  const fetchShortLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('short_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShortLinks(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchClickData = async () => {
    try {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('short_link_id, timestamp')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Process data for chart
      const processedData = data.reduce((acc, click) => {
        const date = new Date(click.timestamp).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
          existingDate.clicks += 1;
        } else {
          acc.push({ date, clicks: 1 });
        }
        return acc;
      }, []);

      setClickData(processedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShortLink = () => {
    // Implement add short link functionality
  };

  if (loading) return <div>Loading tracking data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tracking</h2>
        <button
          onClick={handleAddShortLink}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Short Link
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Click Analytics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={clickData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Short Links</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Short Code</th>
                <th className="py-2 px-4 text-left">Original URL</th>
                <th className="py-2 px-4 text-left">Created At</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortLinks.map((link) => (
                <tr key={link.id} className="border-b">
                  <td className="py-2 px-4">{link.short_code}</td>
                  <td className="py-2 px-4">{link.original_url}</td>
                  <td className="py-2 px-4">{new Date(link.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <a
                      href={`/go/${link.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tracking;