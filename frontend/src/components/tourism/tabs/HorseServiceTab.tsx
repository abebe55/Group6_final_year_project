// frontend/src/components/tourism/tabs/HorseServiceTab.tsx
"use client";

import { useEffect, useState } from "react";

interface HorseServiceSummaryDto {
  id: number;
  ownerName: string;
  contactInfo: string;
  cost: number;
}

interface Props {
  tourismId: number;  // ✅ Fixes the Props error
}

export default function HorseServiceTab({ tourismId }: Props) {
  const [horseServices, setHorseServices] = useState<HorseServiceSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHorseServices = async () => {
    try {
      setLoading(true);
      // Call your horse service endpoint
      const res = await fetch(`/api/tourisms/${tourismId}/horse-services`);
      if (!res.ok) throw new Error("Failed to load horse services");
      const data = await res.json();
      setHorseServices(data);
    } catch (err: any) {
      setError(err.message || "Failed to load horse services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHorseServices();
  }, [tourismId]);

  if (loading) return <p className="text-gray-500">Loading horse services...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!horseServices.length) return <p className="text-gray-500">No horse services available.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Horse Services</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {horseServices.map((service) => (
          <div key={service.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-lg mb-2">{service.ownerName}</h4>
            <p className="text-gray-600 mb-2">{service.contactInfo}</p>
            <p className="text-2xl font-bold text-green-700">${service.cost}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
