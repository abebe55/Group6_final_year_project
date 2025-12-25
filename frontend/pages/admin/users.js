import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';

export default function AdminUsers() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  return (
    <Layout title="Manage Users - Admin">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Manage Users</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-gray-600">
            <p className="text-lg mb-4">User management interface</p>
            <p>This feature allows administrators to:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>View all registered users</li>
              <li>Activate/deactivate user accounts</li>
              <li>Grant or revoke admin roles</li>
              <li>Delete user accounts</li>
            </ul>
            <div className="mt-8 p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                API endpoints are ready in the backend. Implement user listing UI as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
