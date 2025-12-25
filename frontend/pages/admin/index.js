import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <Layout title="Admin Dashboard - North Wollo Tourism">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/places"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">🏛️</div>
            <h2 className="text-2xl font-semibold mb-2">Manage Places</h2>
            <p className="text-gray-600">Add, edit, or remove tourism places</p>
          </Link>

          <Link
            href="/admin/hotels"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">🏨</div>
            <h2 className="text-2xl font-semibold mb-2">Manage Hotels</h2>
            <p className="text-gray-600">Add, edit, or remove hotels</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold mb-2">Manage Users</h2>
            <p className="text-gray-600">View and manage user accounts</p>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2">Statistics</h2>
            <p className="text-gray-600">View platform statistics</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⭐</div>
            <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
            <p className="text-gray-600">Manage ratings and reviews</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Configure system settings</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
