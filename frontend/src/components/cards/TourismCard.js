import Link from 'next/link';

export default function TourismCard({ place }) {
  return (
    <Link
      href={`/places/${place.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="h-48 bg-gray-300 relative">
        {place.imageUrl ? (
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🏛️</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{place.name}</h3>
        {place.wereda && (
          <p className="text-sm text-gray-600 mb-2">📍 {place.wereda}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            👁️ {place.viewersCount || 0} views
          </span>
          {place.category && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {place.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
