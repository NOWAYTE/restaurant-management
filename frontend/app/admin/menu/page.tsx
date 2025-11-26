'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

export default function AdminMenuPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetchMenuItems();
    }
  }, [session]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to load menu items');
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      console.log('Deleting menu item with ID:', id);
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Delete failed with status:', response.status, 'Response:', responseData);
        throw new Error(responseData.message || 'Failed to delete menu item');
      }
      
      console.log('Delete successful, refreshing menu items...');
      await fetchMenuItems();
    } catch (err) {
      console.error('Error in handleDelete:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    console.log('Editing item with ID:', item.id);
    if (!item.id) {
      console.error('Cannot edit item: No ID provided');
      setError('Cannot edit item: Invalid item ID');
      return;
    }
    
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_available: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update menu item status');
      
      await fetchMenuItems();
    } catch (err) {
      console.error('Error toggling menu item status:', err);
      setError('Failed to update menu item status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Current editingId:', editingId);
    
    // If we're editing but don't have an ID, something went wrong
    if (editingId === null || editingId === undefined) {
      console.error('No editing ID found when trying to update menu item');
      setError('Error: No menu item ID found for update');
      return;
    }

    const baseUrl = '/api/menu';
    const url = editingId ? `${baseUrl}/${editingId}` : baseUrl;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const requestBody = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        is_available: Boolean(formData.is_available)
      };

      console.log('Sending request to:', url);
      console.log('Request body:', requestBody);
      console.log('Using method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Request failed with status:', response.status, 'Response:', responseData);
        throw new Error(responseData.message || (editingId ? 'Failed to update menu item' : 'Failed to add menu item'));
      }

      // Reset form and fetch updated items
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_available: true
      });
      setIsAdding(false);
      setEditingId(null); // Only reset editingId after successful request
      await fetchMenuItems();
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError(`Failed to ${editingId ? 'update' : 'add'} menu item. Please try again.`);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!session || session.user.role !== 'admin') {
    return <div className="p-6">Unauthorized</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button 
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              image_url: '',
              is_available: true
            });
            setEditingId(null);
            setIsAdding(!isAdding);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isAdding ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={formData.is_available}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                Available
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="h-32 w-32 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingId ? 'Update' : 'Add'} Menu Item
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-40 object-cover rounded mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                  }}
                />
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  {item.category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mt-1">
                      {item.category}
                    </span>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                  )}
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    item.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.is_available 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {item.is_available ? 'Make Unavailable' : 'Make Available'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No menu items found. Click "Add New Item" to get started.
          </div>
        )}
      </div>
    </div>
  );
}