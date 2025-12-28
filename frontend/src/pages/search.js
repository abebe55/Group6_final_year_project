import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { apiRequest } from '../utils/api';
import { TOURISM_CATEGORIES } from '../utils/constants';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('viewersCount');

  const { data, isLoading } = useQuery({
    queryKey: ['search', category, sortBy],
    queryFn: () => {
      const params = new URLSearchParams({
        page: '0',
        size: '20',
        sortBy,
        direction: 'DESC'
      });
      if (category) params.append('category', category);
      return apiRequest(`/search/tourism?${params}`);
    }
  });

  const filteredResults = data?.content?.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Search - North Wollo Tourism">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Search Tourism Places</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                placeholder="Enter place name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                <option value="viewersCount">Most Viewed</option>
                <option value="name">Name</option>
                <option value="createdAt">Newest</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategory('');
                  setSortBy('viewersCount');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResults.map((place) => (
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
        )}

        {!isLoading && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No places found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
