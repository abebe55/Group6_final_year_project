// frontend/src/services/horse.service.ts
import { api } from "./api";
import { HorseServiceSummaryDto } from "@/types/horse";

export async function getHorseServicesByTourism(tourismId: number): Promise<HorseServiceSummaryDto[]> {
  const services = await api.get<HorseServiceSummaryDto[]>(`/tourisms/${tourismId}/horse-services`);
  return services.data || services;
}

export async function getHorseServicesByRoad(roadId: number): Promise<HorseServiceSummaryDto[]> {
  const services = await api.get<HorseServiceSummaryDto[]>(`/road-info/${roadId}/horse-services`);
  return services.data || services;
}
