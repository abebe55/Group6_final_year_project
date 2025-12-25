"use client";

import { useEffect, useState } from "react";
import RoadInfo from "@/components/road/RoadInfo";
import HorseServiceList from "@/components/horse/HorseServiceList";
import { RoadInfoDto } from "@/types/map";
import { getRoadInfoByTourism } from "@/services/map.service";

interface Props {
  tourismId: number;
}

export default function RoadInfoTab({ tourismId }: Props) {
  const [roads, setRoads] = useState<RoadInfoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoadInfo() {
      try {
        setLoading(true);
        const data = await getRoadInfoByTourism(tourismId);
        setRoads(data);
      } catch (err: any) {
        setError(err.message || "Failed to load road information");
      } finally {
        setLoading(false);
      }
    }

    loadRoadInfo();
  }, [tourismId]);

  if (loading) {
    return <p className="text-gray-500">Loading road information...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!roads.length) {
    return <p className="text-gray-500">No road information available.</p>;
  }

  return (
    <div className="space-y-6">
      {roads.map((road) => (
        <div
          key={road.id}
          className="border rounded-lg p-4 shadow-sm bg-white"
        >
          {/* Road Info */}
          <RoadInfo road={road} />

          {/* Horse Services (optional) */}
          {road.id && (
            <div className="mt-4">
              <HorseServiceList roadInfoId={road.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
