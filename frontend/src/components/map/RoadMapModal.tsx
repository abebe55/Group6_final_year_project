"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPointDto } from "@/types/map";
import { getMapPointsByRoad, getMapPointsByTourism } from "@/services/map.service";

// Dynamically import the map to avoid SSR issues with Leaflet
const MapWithRoute = dynamic(() => import("./MapWithRoute"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roadId: number;
  tourismId?: number;
  roadType: string;
  initialPlace: string;
  destinationName: string;
}

export default function RoadMapModal({
  isOpen,
  onClose,
  roadId,
  tourismId,
  roadType,
  initialPlace,
  destinationName,
}: Props) {
  const [mapPoints, setMapPoints] = useState<MapPointDto[]>([]);
  const [tourismPoints, setTourismPoints] = useState<MapPointDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0); // Key to force map re-mount

  useEffect(() => {
    if (isOpen) {
      setMapKey(prev => prev + 1); // Increment key to force new map instance
      loadMapData();
    } else {
      // Reset state when modal closes
      setMapPoints([]);
      setTourismPoints([]);
      setLoading(true);
      setError(null);
    }
  }, [isOpen, roadId, tourismId]);

  const loadMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch road map points
      const roadPoints = await getMapPointsByRoad(roadId);
      setMapPoints(roadPoints);

      // Also fetch tourism place points if tourismId is provided
      if (tourismId) {
        try {
          const tourismMapPoints = await getMapPointsByTourism(tourismId);
          setTourismPoints(tourismMapPoints);
        } catch (err) {
          // Tourism points are optional, don't fail if not found
          console.log("No tourism map points found");
          setTourismPoints([]);
        }
      }
    } catch (err: any) {
      console.log("Map data load info:", err);
      // Don't set error - empty map points is a valid state
      setMapPoints([]);
      setTourismPoints([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allPoints = [...mapPoints, ...tourismPoints];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🗺️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Route Map</h2>
                  <p className="text-white/90 text-sm">
                    {initialPlace} → {destinationName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Route Info Bar */}
          <div className="bg-gray-50 px-6 py-3 border-b flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">
                {roadType === "CAR" && "🚗"}
                {roadType === "FOOT" && "🚶"}
                {roadType === "PLANE" && "✈️"}
                {roadType === "HORSE" && "🐎"}
              </span>
              <span className="font-medium">{roadType}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              📍 {allPoints.length} waypoints
            </span>
          </div>

          {/* Map Container */}
          <div className="h-[500px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading route map...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-6">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Map Not Available</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                    <p className="text-amber-800 text-sm">
                      <strong>Tip:</strong> Map points need to be configured by an administrator for this route.
                    </p>
                  </div>
                </div>
              </div>
            ) : allPoints.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-6">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Waypoints Yet</h3>
                  <p className="text-gray-600 mb-4">
                    This route doesn't have map waypoints configured yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Route: <strong>{initialPlace}</strong> → <strong>{destinationName}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <MapWithRoute 
                key={mapKey}
                points={allPoints} 
                roadType={roadType}
                startPlace={initialPlace}
                endPlace={destinationName}
              />
            )}
          </div>

          {/* Footer with Legend */}
          {!loading && !error && allPoints.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-medium text-gray-700">Legend:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span className="text-gray-600">Tourism Place</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600">Road Point</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-600">Hotel</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
