"use client";

import { useEffect, useState } from "react";
import { getMapPointsByTourism } from "@/services/map.service";
import { MapPointDto } from "@/types/map";
import MapContainer from "@/components/map/MapContainer";

interface Props {
   tourismId: number;  // ✅ ADD THIS LINE
}

export default function MapInfoTab({ tourismId }: Props) {
  const [mapPoints, setMapPoints] = useState<MapPointDto[]>([]);

  useEffect(() => {
    getMapPointsByTourism(tourismId).then(setMapPoints);
  }, [tourismId]);

  if (!mapPoints.length) return <p className="text-gray-500">No map information available.</p>;

  return (
    <div className="h-[500px]">
      {/* MapContainer expects points with lat/lng */}
      <MapContainer points={mapPoints} />
    </div>
  );
}
