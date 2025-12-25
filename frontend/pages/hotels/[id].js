import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';

export default function HotelDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => apiRequest(`/hotels/${id}`),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hotel) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700">Hotel not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${hotel.name} - North Wollo Tourism`}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {hotel.images && hotel.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {hotel.images.map((image, index) => (
                <div key={index} className="h-64 bg-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${hotel.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">{hotel.name}</h1>
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl">
                  {'⭐'.repeat(hotel.starRating)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="text-gray-700 whitespace-pre-line">{hotel.contactInfo}</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Booking Steps</h2>
                <p className="text-gray-700 whitespace-pre-line">{hotel.bookingSteps}</p>
              </div>
            </div>

            {hotel.policies && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Hotel Policies</h2>
                <p className="text-gray-700 whitespace-pre-line">{hotel.policies}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
