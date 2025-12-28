import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Layout from '../../../components/layout/Layout';
import { apiRequest } from '../../../utils/api';
import { TOURISM_CATEGORIES } from '../../../utils/constants';

export default function CreateTourismPlace() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'HERITAGE',
    wereda: '',
    kebele: '',
    bestTime: '',
    visitTime: '',
    peaceInfo: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('/tourism', 'POST', data, token),
    onSuccess: () => {
      alert('Tourism place created successfully!');
      router.push('/admin/places');
    },
    onError: (error) => {
      alert('Error creating place: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    if (submitData.latitude) submitData.latitude = parseFloat(submitData.latitude);
    if (submitData.longitude) submitData.longitude = parseFloat(submitData.longitude);
    
    createMutation.mutate(submitData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout title="Create Tourism Place - Admin">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Create New Tourism Place</h1>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  name="wereda"
                  required
                  value={formData.wereda}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kebele *
                </label>
                <input
                  type="text"
                  name="kebele"
                  required
                  value={formData.kebele}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={handleChange}
                  placeholder="e.g., October to March"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Duration
                </label>
                <input
                  type="text"
                  name="visitTime"
                  value={formData.visitTime}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 11.8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 39.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the tourism place..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Information
              </label>
              <textarea
                name="peaceInfo"
                rows="3"
                value={formData.peaceInfo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Safety tips and information for visitors..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Place'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/places')}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
