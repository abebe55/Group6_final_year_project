import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';

export default function AdminHotels() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    starRating: 3,
    contactInfo: '',
    bookingSteps: '',
    policies: ''
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => apiRequest('/hotels', 'GET', null, token),
    enabled: !!token
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('/hotels', 'POST', data, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      setShowForm(false);
      setFormData({
        name: '',
        starRating: 3,
        contactInfo: '',
        bookingSteps: '',
        policies: ''
      });
      alert('Hotel created successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/hotels/${id}`, 'DELETE', null, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      alert('Hotel deleted successfully');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout title="Manage Hotels - Admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Hotels</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add New Hotel'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create New Hotel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
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
                    Star Rating *
                  </label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <option key={star} value={star}>{star} Star</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Phone, email, address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Steps
                </label>
                <textarea
                  rows="3"
                  value={formData.bookingSteps}
                  onChange={(e) => setFormData({ ...formData, bookingSteps: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="How to book this hotel..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Policies
                </label>
                <textarea
                  rows="3"
                  value={formData.policies}
                  onChange={(e) => setFormData({ ...formData, policies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Check-in/out times, cancellation policy..."
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Hotel'}
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500">
                    {'⭐'.repeat(hotel.starRating)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{hotel.contactInfo}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/hotels/${hotel.id}`)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!hotels || hotels.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hotels found. Add your first hotel!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
