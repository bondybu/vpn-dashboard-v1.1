import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle, Edit, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';

interface ListicleItem {
  id: string;
  title: string;
  description: string;
  logo_url: string;
  button_text: string;
  button_url: string;
  order_index: number;
  page_id: string;
  listicle_pages: {
    title: string;
  };
}

interface ListiclePage {
  id: string;
  title: string;
}

const ListicleItems: React.FC = () => {
  const [items, setItems] = useState<ListicleItem[]>([]);
  const [pages, setPages] = useState<ListiclePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    logo_url: '',
    button_text: '',
    button_url: '',
    page_id: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<ListicleItem | null>(null);

  useEffect(() => {
    fetchItems();
    fetchPages();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listicle_items')
        .select('*, listicle_pages(title)')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('listicle_pages')
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddItem = async () => {
    try {
      const { data, error } = await supabase
        .from('listicle_items')
        .insert([{ ...newItem, order_index: items.length }])
        .select();

      if (error) throw error;

      setItems([...items, data[0]]);
      setNewItem({
        title: '',
        description: '',
        logo_url: '',
        button_text: '',
        button_url: '',
        page_id: ''
      });
      setIsAddingNew(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;
    try {
      const { data, error } = await supabase
        .from('listicle_items')
        .update(editingItem)
        .eq('id', editingItem.id)
        .select();

      if (error) throw error;

      setItems(items.map(item => item.id === editingItem.id ? data[0] : item));
      setEditingItem(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase
          .from('listicle_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleCloneItem = async (item: ListicleItem) => {
    try {
      const { id, ...clonedItem } = item;
      const { data, error } = await supabase
        .from('listicle_items')
        .insert([{ ...clonedItem, title: `${clonedItem.title} (Copy)`, order_index: items.length }])
        .select();

      if (error) throw error;

      setItems([...items, data[0]]);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReorderItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newItems = [...items];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(newIndex, 0, movedItem);

    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_index: index
      }));

      const { error } = await supabase
        .from('listicle_items')
        .upsert(updates);

      if (error) throw error;

      setItems(newItems);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading items...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Listicle Items</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Item
        </button>
      </div>

      {(isAddingNew || editingItem) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <h3 className="text-xl font-semibold mb-4">
            {isAddingNew ? 'Add New Listicle Item' : 'Edit Listicle Item'}
          </h3>
          <input
            type="text"
            placeholder="Title"
            value={editingItem ? editingItem.title : newItem.title}
            onChange={(e) => editingItem 
              ? setEditingItem({ ...editingItem, title: e.target.value })
              : setNewItem({ ...newItem, title: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <textarea
            placeholder="Description"
            value={editingItem ? editingItem.description : newItem.description}
            onChange={(e) => editingItem
              ? setEditingItem({ ...editingItem, description: e.target.value })
              : setNewItem({ ...newItem, description: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Logo URL"
            value={editingItem ? editingItem.logo_url : newItem.logo_url}
            onChange={(e) => editingItem
              ? setEditingItem({ ...editingItem, logo_url: e.target.value })
              : setNewItem({ ...newItem, logo_url: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Button Text"
            value={editingItem ? editingItem.button_text : newItem.button_text}
            onChange={(e) => editingItem
              ? setEditingItem({ ...editingItem, button_text: e.target.value })
              : setNewItem({ ...newItem, button_text: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Button URL"
            value={editingItem ? editingItem.button_url : newItem.button_url}
            onChange={(e) => editingItem
              ? setEditingItem({ ...editingItem, button_url: e.target.value })
              : setNewItem({ ...newItem, button_url: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          />
          <select
            value={editingItem ? editingItem.page_id : newItem.page_id}
            onChange={(e) => editingItem
              ? setEditingItem({ ...editingItem, page_id: e.target.value })
              : setNewItem({ ...newItem, page_id: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-full"
          >
            <option value="">Select a page</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>{page.title}</option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              onClick={editingItem ? handleEditItem : handleAddItem}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              {editingItem ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingItem(null);
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
              <th className="py-2 px-4 text-left">Page</th>
              <th className="py-2 px-4 text-left">Order</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="py-2 px-4">{item.title}</td>
                <td className="py-2 px-4">{item.listicle_pages.title}</td>
                <td className="py-2 px-4">{item.order_index}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-blue-500 hover:text-blue-600 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleCloneItem(item)}
                    className="text-green-500 hover:text-green-600 mr-2"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => handleReorderItem(item.id, 'up')}
                    className="text-yellow-500 hover:text-yellow-600 mr-2"
                    disabled={index === 0}
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    onClick={() => handleReorderItem(item.id, 'down')}
                    className="text-yellow-500 hover:text-yellow-600 mr-2"
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
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

export default ListicleItems;