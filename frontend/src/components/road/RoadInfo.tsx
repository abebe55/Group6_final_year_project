// frontend/src/components/road/RoadInfo.tsx
"use client";

import { RoadInfoDto } from "@/types/map";

interface Props {
  road: RoadInfoDto;
}

export default function RoadInfo({ road }: Props) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          🛤️ {road.routeDescription || 'Road Information'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          road.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
          road.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {road.difficulty?.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {road.routeDescription && (
        <p className="text-gray-700 leading-relaxed">{road.routeDescription}</p>
      )}

      {/* Distance & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Distance</p>
          <p className="text-2xl font-bold text-gray-900">{road.distance} km</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Estimated Time</p>
          <p className="text-xl font-semibold text-green-700">{road.estimatedTime}</p>
        </div>
      </div>

      {/* Major Landmarks */}
      {road.majorLandmarks && road.majorLandmarks.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Major Landmarks</p>
         <div className="flex flex-wrap gap-2">  ✅ Correct for React/Next.js

            {road.majorLandmarks.map((landmark, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {landmark}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Distance Summary */}
      <div className="pt-4 border-t">
        <p className="text-lg font-semibold text-gray-900">
          Perfect for your journey to this tourism site!
        </p>
      </div>
    </div>
  );
}
