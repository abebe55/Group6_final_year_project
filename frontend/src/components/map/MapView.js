import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <p className="text-gray-600">Loading map...</p>
    </div>
  )
});

export default function MapView({ center, zoom = 10, markers = [] }) {
  return (
    <div className="w-full h-full">
      <MapComponent center={center} zoom={zoom} markers={markers} />
    </div>
  );
}
