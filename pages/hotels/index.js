import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';

export default function Hotels() {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => apiRequest('/hotels')
  });

  return (
    <Layout title="Hotels - North Wollo">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Hotels & Accommodations</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel) => (
              <Link
                key={hotel.id}
                href={`/hotels/${hotel.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <div className="h-48 bg-gray-300">
                  {hotel.images && hotel.images[0] && (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">
                      {'⭐'.repeat(hotel.starRating)}
                    </span>
                    <span className="ml-2 text-gray-600">
                      {hotel.starRating} Star
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{hotel.contactInfo}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!hotels || hotels.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hotels available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
