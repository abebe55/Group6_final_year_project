import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { apiRequest } from '../utils/api';
import { TOURISM_CATEGORIES } from '../utils/constants';

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['tourism-places'],
    queryFn: () => apiRequest('/search/tourism?page=0&size=6&sortBy=viewersCount&direction=DESC')
  });

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Discover North Wollo</h1>
          <p className="text-xl mb-8">Explore the rich heritage and natural beauty of Ethiopia</p>
          <Link
            href="/places"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Explore Places
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                  <p className="text-gray-600">{place.viewersCount} views</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(TOURISM_CATEGORIES).map(([key, label]) => (
              <Link
                key={key}
                href={`/places?category=${key}`}
                className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition"
              >
                <div className="text-3xl mb-2">🏛️</div>
                <div className="font-semibold">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
