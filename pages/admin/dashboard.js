import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const places = await apiRequest('/search/tourism?page=0&size=1', 'GET', null, token);
      return {
        totalPlaces: places.totalElements || 0,
        totalHotels: 0,
        totalUsers: 0
      };
    }
  });

  return (
    <Layout title="Admin Dashboard">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-2">🏛️</div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats?.totalPlaces || 0}
            </h3>
            <p className="text-gray-600">Tourism Places</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-2">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats?.totalHotels || 0}
            </h3>
            <p className="text-gray-600">Hotels</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </h3>
            <p className="text-gray-600">Users</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/admin/places')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Manage Places
            </button>
            <button
              onClick={() => router.push('/admin/hotels')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Manage Hotels
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Manage Users
            </button>
            <button
              onClick={() => router.push('/places')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              View Public Site
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
