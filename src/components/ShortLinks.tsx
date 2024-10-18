import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

interface ShortLink {
  id: string;
  original_url: string;
  short_code: string;
  listicle_item_id: string | null;
  created_at: string;
}

interface ListicleItem {
  id: string;
  title: string;
}

const ShortLinks: React.FC = () => {
  const { supabase } = useAuth();
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [listicleItems, setListicleItems] = useState<ListicleItem[]>([]);
  const [newLink, setNewLink] = useState({ original_url: '', short_code: '', listicle_item_id: '' });
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

  useEffect(() => {
    fetchShortLinks();
    fetchListicleItems();
  }, []);

  const fetchShortLinks = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('short_links').select('*');
    if (error) {
      console.error('Error fetching short links:', error);
    } else {
      setShortLinks(data || []);
    }
  };

  const fetchListicleItems = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('listicle_items').select('id, title');
    if (error) {
      console.error('Error fetching listicle items:', error);
    } else {
      setListicleItems(data || []);
    }
  };

  const handleCreateLink = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('short_links').insert([newLink]);
    if (error) {
      console.error('Error creating short link:', error);
    } else {
      fetchShortLinks();
      setNewLink({ original_url: '', short_code: '', listicle_item_id: '' });
    }
  };

  const handleUpdateLink = async () => {
    if (!supabase || !editingLink) return;
    const { data, error } = await supabase
      .from('short_links')
      .update(editingLink)
      .eq('id', editingLink.id);
    if (error) {
      console.error('Error updating short link:', error);
    } else {
      fetchShortLinks();
      setEditingLink(null);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('short_links').delete().eq('id', id);
    if (error) {
      console.error('Error deleting short link:', error);
    } else {
      fetchShortLinks();
    }
  };

  const generateShortCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Short Links Management</h1>
      
      {/* Create new short link form */}
      <div className="bg-gray-800 p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Short Link</h2>
        <input
          type="text"
          placeholder="Original URL"
          value={newLink.original_url}
          onChange={(e) => setNewLink({ ...newLink, original_url: e.target.value })}
          className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
        />
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Short Code"
            value={newLink.short_code}
            onChange={(e) => setNewLink({ ...newLink, short_code: e.target.value })}
            className="bg-gray-700 text-white p-2 rounded-l-md w-full"
          />
          <button
            onClick={() => setNewLink({ ...newLink, short_code: generateShortCode() })}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-md"
          >
            Generate
          </button>
        </div>
        <select
          value={newLink.listicle_item_id}
          onChange={(e) => setNewLink({ ...newLink, listicle_item_id: e.target.value })}
          className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
        >
          <option value="">Select a listicle item (optional)</option>
          {listicleItems.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
        <button
          onClick={handleCreateLink}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          <Plus className="inline-block mr-2" size={16} />
          Create Short Link
        </button>
      </div>

      {/* Short links list */}
      <div className="bg-gray-800 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Short Links List</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Short Code</th>
              <th className="text-left p-2">Original URL</th>
              <th className="text-left p-2">Listicle Item</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shortLinks.map((link) => (
              <tr key={link.id}>
                <td className="p-2">{link.short_code}</td>
                <td className="p-2">{link.original_url}</td>
                <td className="p-2">
                  {listicleItems.find(item => item.id === link.listicle_item_id)?.title || '-'}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setEditingLink(link)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const fullUrl = `${window.location.origin}/go/${link.short_code}`;
                      navigator.clipboard.writeText(fullUrl);
                      alert('Short link copied to clipboard!');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit short link modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-md w-1/2">
            <h2 className="text-xl font-semibold mb-2">Edit Short Link</h2>
            <input
              type="text"
              placeholder="Original URL"
              value={editingLink.original_url}
              onChange={(e) => setEditingLink({ ...editingLink, original_url: e.target.value })}
              className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Short Code"
              value={editingLink.short_code}
              onChange={(e) => setEditingLink({ ...editingLink, short_code: e.target.value })}
              className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
            />
            <select
              value={editingLink.listicle_item_id || ''}
              onChange={(e) => setEditingLink({ ...editingLink, listicle_item_id: e.target.value || null })}
              className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
            >
              <option value="">Select a listicle item (optional)</option>
              {listicleItems.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateLink}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Update Short Link
            </button>
            <button
              onClick={() => setEditingLink(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortLinks;