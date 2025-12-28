import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';
import { TOURISM_CATEGORIES } from '../../utils/constants';

export default function AdminPlaces() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'HERITAGE',
    wereda: '',
    kebele: '',
    bestTime: '',
    visitTime: '',
    peaceInfo: ''
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const { data: places, isLoading } = useQuery({
    queryKey: ['admin-places'],
    queryFn: () => apiRequest('/search/tourism?page=0&size=100', 'GET', null, token),
    enabled: !!token
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/tourism/${id}`, 'DELETE', null, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-places']);
      alert('Place deleted successfully');
    }
  });

  const blockMutation = useMutation({
    mutationFn: (id) => apiRequest(`/tourism/${id}/block`, 'PATCH', null, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-places']);
      alert('Place blocked successfully');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('/tourism', 'POST', data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-places']);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        category: 'HERITAGE',
        wereda: '',
        kebele: '',
        bestTime: '',
        visitTime: '',
        peaceInfo: ''
      });
      alert('Place created successfully');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this place?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout title="Manage Places - Admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Tourism Places</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add New Place'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingPlace ? 'Edit Place' : 'Create New Place'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(TOURISM_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wereda *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.wereda}
                    onChange={(e) => setFormData({ ...formData, wereda: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kebele *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kebele}
                    onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={formData.bestTime}
                    onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Duration
                  </label>
                  <input
                    type="text"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Safety Information
                </label>
                <textarea
                  rows="3"
                  value={formData.peaceInfo}
                  onChange={(e) => setFormData({ ...formData, peaceInfo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Place'}
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {places?.content?.map((place) => (
                  <tr key={place.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{place.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {place.wereda || 'N/A'}, {place.kebele || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{place.viewersCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/places/${place.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => blockMutation.mutate(place.id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        Block
                      </button>
                      <button
                        onClick={() => handleDelete(place.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
