import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle, Edit, Trash2, Copy } from 'lucide-react';

interface ListiclePage {
  id: string;
  title: string;
  slug: string;
  site_id: string;
  sites: {
    name: string;
  };
}

interface Site {
  id: string;
  name: string;
}

const ListiclePages: React.FC = () => {
  const [pages, setPages] = useState<ListiclePage[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({ title: '', slug: '', site_id: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPage, setEditingPage] = useState<ListiclePage | null>(null);

  useEffect(() => {
    fetchPages();
    fetchSites();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listicle_pages')
        .select('*, sites(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddPage = async () => {
    try {
      const { data, error } = await supabase
        .from('listicle_pages')
        .insert([newPage])
        .select();

      if (error) throw error;

      setPages([...pages, data[0]]);
      setNewPage({ title: '', slug: '', site_id: '' });
      setIsAddingNew(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPage = async () => {
    if (!editingPage) return;
    try {
      const { data, error } = await supabase
        .from('listicle_pages')
        .update(editingPage)
        .eq('id', editingPage.id)
        .select();

      if (error) throw error;

      setPages(pages.map(page => page.id === editingPage.id ? data[0] : page));
      setEditingPage(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        const { error } = await supabase
          .from('listicle_pages')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setPages(pages.filter(page => page.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleClonePage = async (id: string) => {
    try {
      const { data: originalPage, error: fetchError } = await supabase
        .from('listicle_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { title, slug, description, site_id } = originalPage;
      const newSlug = `${slug}-copy`;

      const { data: newPage, error: insertError } = await supabase
        .from('listicle_pages')
        .insert([
          { title: `${title} (Copy)`, slug: newSlug, description, site_id }
        ])
        .select();

      if (insertError) throw insertError;

      setPages([...pages, newPage[0]]);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading pages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Listicle Pages</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Page
        </button>
      </div>

      {(isAddingNew || editingPage) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h3 className="text-xl font-semibold mb-4">
            {isAddingNew ? 'Add New Listicle Page' : 'Edit Listicle Page'}
          </h3>
          <input
            type="text"
            placeholder="Page Title"
            value={editingPage ? editingPage.title : newPage.title}
            onChange={(e) => editingPage
              ? setEditingPage({ ...editingPage, title: e.target.value })
              : setNewPage({ ...newPage, title: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Slug"
            value={editingPage ? editingPage.slug : newPage.slug}
            onChange={(e) => editingPage
              ? setEditingPage({ ...editingPage, slug: e.target.value })
              : setNewPage({ ...newPage, slug: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <select
            value={editingPage ? editingPage.site_id : newPage.site_id}
            onChange={(e) => editingPage
              ? setEditingPage({ ...editingPage, site_id: e.target.value })
              : setNewPage({ ...newPage, site_id: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              onClick={editingPage ? handleEditPage : handleAddPage}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              {editingPage ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingPage(null);
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
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left">Slug</th>
              <th className="py-2 px-4 text-left">Site</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-gray-700">
                <td className="py-2 px-4">{page.title}</td>
                <td className="py-2 px-4">{page.slug}</td>
                <td className="py-2 px-4">{page.sites.name}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => setEditingPage(page)}
                    className="text-blue-500 hover:text-blue-600 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleClonePage(page.id)}
                    className="text-green-500 hover:text-green-600 mr-2"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
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

export default ListiclePages;