import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';
import { TOURISM_CATEGORIES, SORT_OPTIONS } from '../../utils/constants';

export default function Places() {
  const router = useRouter();
  const { category: queryCategory } = router.query;
  
  const [category, setCategory] = useState(queryCategory || '');
  const [sortBy, setSortBy] = useState('viewersCount');
  const [direction, setDirection] = useState('DESC');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['tourism-places', category, sortBy, direction, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12',
        sortBy,
        direction
      });
      if (category) params.append('category', category);
      return apiRequest(`/search/tourism?${params}`);
    }
  });

  return (
    <Layout title="Tourism Places - North Wollo">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Tourism Places</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(TOURISM_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.content?.map((place) => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="h-48 bg-gray-300">
                    {place.imageUrl && (
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
                    <p className="text-gray-600 text-sm">{place.viewersCount} views</p>
                  </div>
                </Link>
              ))}
            </div>

            {data && data.totalElements > 0 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {page + 1} of {Math.ceil(data.totalElements / data.size)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * data.size >= data.totalElements}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
