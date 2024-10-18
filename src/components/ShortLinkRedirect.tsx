import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ShortLinkRedirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      if (!supabase || !shortCode) return;

      try {
        // Fetch the original URL
        const { data, error } = await supabase
          .from('short_links')
          .select('original_url, id')
          .eq('short_code', shortCode)
          .single();

        if (error) throw error;

        if (data) {
          // Record the click
          const { error: clickError } = await supabase.from('link_clicks').insert([
            {
              short_link_id: data.id,
              subid: new URLSearchParams(window.location.search).get('subid') || null,
              ip_address: null, // You may want to implement IP address logging on the server-side
              user_agent: navigator.userAgent,
              referrer: document.referrer,
            },
          ]);

          if (clickError) console.error('Error recording click:', clickError);

          // Redirect to the original URL
          window.location.href = data.original_url;
        } else {
          setError('Short link not found');
        }
      } catch (err) {
        console.error('Error redirecting:', err);
        setError('An error occurred while redirecting');
      }
    };

    redirectToOriginalUrl();
  }, [supabase, shortCode, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">{error}</h1>
          <p className="text-white mb-4">The requested short link could not be found or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Redirecting...</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default ShortLinkRedirect;