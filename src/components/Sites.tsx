import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
}

const Sites: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSite, setNewSite] = useState({ name: '', slug: '', custom_domain: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .insert([newSite])
        .select();

      if (error) throw error;

      setSites([...sites, data[0]]);
      setNewSite({ name: '', slug: '', custom_domain: '' });
      setIsAddingNew(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditSite = async () => {
    if (!editingSite) return;
    try {
      const { data, error } = await supabase
        .from('sites')
        .update(editingSite)
        .eq('id', editingSite.id)
        .select();

      if (error) throw error;

      setSites(sites.map(site => site.id === editingSite.id ? data[0] : site));
      setEditingSite(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        const { error } = await supabase
          .from('sites')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSites(sites.filter(site => site.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (loading) return <div>Loading sites...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sites</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Site
        </button>
      </div>

      {(isAddingNew || editingSite) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h3 className="text-xl font-semibold mb-4">
            {isAddingNew ? 'Add New Site' : 'Edit Site'}
          </h3>
          <input
            type="text"
            placeholder="Site Name"
            value={editingSite ? editingSite.name : newSite.name}
            onChange={(e) => editingSite
              ? setEditingSite({ ...editingSite, name: e.target.value })
              : setNewSite({ ...newSite, name: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Slug"
            value={editingSite ? editingSite.slug : newSite.slug}
            onChange={(e) => editingSite
              ? setEditingSite({ ...editingSite, slug: e.target.value })
              : setNewSite({ ...newSite, slug: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Custom Domain (optional)"
            value={editingSite ? editingSite.custom_domain || '' : newSite.custom_domain}
            onChange={(e) => editingSite
              ? setEditingSite({ ...editingSite, custom_domain: e.target.value })
              : setNewSite({ ...newSite, custom_domain: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <div className="flex justify-end">
            <button
              onClick={editingSite ? handleEditSite : handleAddSite}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              {editingSite ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingSite(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Slug</th>
              <th className="py-2 px-4 text-left">Custom Domain</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-gray-700">
                <td className="py-2 px-4">{site.name}</td>
                <td className="py-2 px-4">{site.slug}</td>
                <td className="py-2 px-4">{site.custom_domain || '-'}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => setEditingSite(site)}
                    className="text-blue-500 hover:text-blue-600 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sites;