import Link from 'next/link';

export default function HotelCard({ hotel }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="h-48 bg-gray-300 relative">
        {hotel.images && hotel.images[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🏨</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{hotel.name}</h3>
        <div className="flex items-center mb-2">
          <span className="text-yellow-500">
            {'⭐'.repeat(hotel.starRating || 0)}
          </span>
          <span className="ml-2 text-sm text-gray-600">
            {hotel.starRating} Star
          </span>
        </div>
        {hotel.contactInfo && (
          <p className="text-sm text-gray-600 truncate">
            📞 {hotel.contactInfo.split('\n')[0]}
          </p>
        )}
      </div>
    </Link>
  );
}
