// frontend/src/services/map.service.ts
import { API_BASE_URL } from "./api";
import { MapPointDto } from "@/types/map";
import { RoadInfoDto } from "@/types/road";

// Get map points by tourism place
// Backend: GET /api/map-points/tourism/{tourismPlaceId}
export async function getMapPointsByTourism(tourismPlaceId: number): Promise<MapPointDto[]> {
  const response = await fetch(`${API_BASE_URL}/map-points/tourism/${tourismPlaceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch map points");
  return response.json();
}

// Get map points by type
// Backend: GET /api/map-points/type/{type}
export async function getMapPointsByType(type: string): Promise<MapPointDto[]> {
  const response = await fetch(`${API_BASE_URL}/map-points/type/${type}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch map points by type");
  return response.json();
}

// Get map points by road
// Backend: GET /api/map-points/road/{roadInfoId}
export async function getMapPointsByRoad(roadInfoId: number): Promise<MapPointDto[]> {
  const response = await fetch(`${API_BASE_URL}/map-points/road/${roadInfoId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    // Return empty array instead of throwing error - no map points is a valid state
    console.log(`No map points found for road ${roadInfoId}`);
    return [];
  }
  return response.json();
}

// Get map point by ID
// Backend: GET /api/map-points/{id}
export async function getMapPointById(id: number): Promise<MapPointDto> {
  const response = await fetch(`${API_BASE_URL}/map-points/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch map point");
  return response.json();
}

// Get road info by tourism place
// Backend: GET /api/tourisms/{tourismPlaceId}/roads
export async function getRoadInfoByTourism(tourismId: number, token?: string | null): Promise<RoadInfoDto[]> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/tourisms/${tourismId}/roads`, {
    method: "GET",
    headers,
  });
  if (!response.ok) throw new Error("Failed to fetch road info");
  return response.json();
}

// Calculate distance between two points
// Backend: GET /api/map-points/distance
export async function calculateDistance(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number> {
  const res = await fetch(
    `${API_BASE_URL}/map-points/distance?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
  );
  if (!res.ok) throw new Error("Failed to calculate distance");
  return res.json();
}
