"use client";

import { useEffect, useState } from "react";
import { getMapPointsByTourism } from "@/services/map.service";
import { MapPointDto } from "@/types/map";
import MapContainer from "@/components/map/MapContainer";

interface Props {
  tourismId: number;
}

export default function MapInfoTab({ tourismId }: Props) {
  const [mapPoints, setMapPoints] = useState<MapPointDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapPoints = async () => {
      if (!tourismId) {
        setError("Missing tourism ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🗺️ Loading map points for tourism:", tourismId);
        
        // ✅ Matches your map.service.ts pattern - NO TOKEN NEEDED
        const points = await getMapPointsByTourism(tourismId);
        setMapPoints(points || []);
        console.log("✅ Map points loaded:", points?.length || 0);
      } catch (err: any) {
        console.error("❌ Failed to load map points:", err);
        setError(err.message || "Failed to load map data");
        setMapPoints([]);
      } finally {
        setLoading(false);
      }
    };

    loadMapPoints();
  }, [tourismId]);

  // Loading state
  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
        <div className="text-center p-8 animate-pulse">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-6"></div>
          <p className="text-2xl font-semibold text-gray-700">Loading Map</p>
          <p className="text-sm text-gray-500 mt-2">Fetching route points...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-6 mx-auto">🗺️</div>
          <h3 className="text-2xl font-bold text-red-700 mb-4">Map Unavailable</h3>
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!mapPoints.length) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="text-center p-12 max-w-md">
          <div className="text-7xl mb-6 mx-auto opacity-75">🗺️</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">No Map Data</h2>
          <p className="text-xl text-gray-600 mb-8">
            No route points available for this destination.
          </p>
          <p className="text-sm text-gray-500">
            Map points will appear here when available.
          </p>
        </div>
      </div>
    );
  }

  // Success - Show Map
  return (
    <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50">
      {/* Map header badge */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
        <span className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
          🗺️ {mapPoints.length} point{mapPoints.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Map Container */}
      <MapContainer points={mapPoints} />
    </div>
  );
}
