import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/layout/Layout';
import { apiRequest } from '../../utils/api';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../../components/map/MapComponent'), {
  ssr: false
});

export default function PlaceDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: place, isLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: () => apiRequest(`/tourism/${id}`),
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
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!place) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700">Place not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${place.name} - North Wollo Tourism`}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {place.imageUrl && (
            <div className="h-96 bg-gray-300">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{place.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Location</h2>
                <p className="text-gray-700">Wereda: {place.wereda}</p>
                <p className="text-gray-700">Kebele: {place.kebele}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Visit Information</h2>
                <p className="text-gray-700">Best Time: {place.bestTime}</p>
                <p className="text-gray-700">Visit Duration: {place.visitTime}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{place.description}</p>
            </div>

            {place.peaceInfo && (
              <div className="mb-8 bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Safety Information</h2>
                <p className="text-gray-700">{place.peaceInfo}</p>
              </div>
            )}

            {place.languages && place.languages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Languages Spoken</h2>
                <div className="flex flex-wrap gap-2">
                  {place.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {place.latitude && place.longitude && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Location Map</h2>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapComponent
                    center={[place.latitude, place.longitude]}
                    markers={[{
                      position: [place.latitude, place.longitude],
                      popup: place.name
                    }]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
