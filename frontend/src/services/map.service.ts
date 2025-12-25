// frontend/src/services/map.service.ts
import { API_BASE_URL } from "./api";
import { api } from "./api";
import { 
  MapPointDto, 
  RoadInfoDto, 
  DistanceInfoDto 
} from "@/types/map";

export async function getMapPointsByTourism(tourismPlaceId: number): Promise<MapPointDto[]> {
  const points = await api.get<MapPointDto[]>(`/map/points/tourism/${tourismPlaceId}`);
  return points.data || points;
}

export async function getMapPointsByType(type: string): Promise<MapPointDto[]> {
  const points = await api.get<MapPointDto[]>(`/map/points/type/${type}`);
  return points.data || points;
}

export async function getRoadInfoByTourism(tourismId: number): Promise<RoadInfoDto[]> {
  const roadInfo = await api.get<RoadInfoDto[]>(`/tourisms/${tourismId}/road-info`);
  return roadInfo.data || roadInfo;
}
// Use raw fetch for simple endpoints, api.get for complex objects
export async function calculateDistance(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number> {
  const res = await fetch(
    `${API_BASE_URL}/map/distance?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
  );
  if (!res.ok) throw new Error("Failed to calculate distance");
  return res.json();
}


export async function getDistanceInfo(from: string, to: string): Promise<DistanceInfoDto> {
  const distanceInfo = await api.get<DistanceInfoDto>(`/map/distance-info?from=${from}&to=${to}`);
  return distanceInfo.data || distanceInfo;
}
