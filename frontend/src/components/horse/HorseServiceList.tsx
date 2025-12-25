// frontend/src/components/horse/HorseServiceList.tsx
"use client";

import { useEffect, useState } from "react";
import { HorseServiceSummaryDto } from "@/types/horse";
import { getHorseServicesByTourism, getHorseServicesByRoad } from "@/services/horse.service";
import Button from "@/components/common/Button";

interface Props {
  tourismPlaceId?: number;
  roadInfoId?: number;
}

const HorseServiceList: React.FC<Props> = ({ tourismPlaceId, roadInfoId }) => {
  const [services, setServices] = useState<HorseServiceSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourismPlaceId) {
      getHorseServicesByTourism(tourismPlaceId)
        .then(res => setServices(res))
        .finally(() => setLoading(false));
    } else if (roadInfoId) {
      getHorseServicesByRoad(roadInfoId)
        .then(res => setServices(res))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tourismPlaceId, roadInfoId]);

  if (loading) return <div>Loading horse services...</div>;
  if (!services.length) return <div>No horse services available.</div>;

  return (
    <div className="space-y-4">
      {services.map(service => (
        <div key={service.id} className="border rounded p-4 shadow hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center">
          <div>
            <h4 className="font-bold text-lg">{service.ownerName}</h4>
            <p>Contact: {service.contactInfo}</p>
            <p>Cost: {service.cost.toFixed(2)} ETB</p>
          </div>
          <div className="mt-2 md:mt-0">
            <Button onClick={() => alert(`Booking horse service with ${service.ownerName}`)}>
              Book Horse
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorseServiceList;
