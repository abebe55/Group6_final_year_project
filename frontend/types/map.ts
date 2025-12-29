// frontend/src/types/map.ts - COMPLETE FILE

// frontend/src/types/map.ts
// Match backend MapPointType enum: TOURISM_PLACE, HOTEL, ROAD
export type MapPointType = "TOURISM_PLACE" | "HOTEL" | "ROAD";


export interface MapPointDto {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: MapPointType;
  description?: string;
  active: boolean;
  tourismPlaceId?: number;
  hotelId?: number;
  roadInfoId?: number;
}

export interface RoadInfoDto {
  id: number;
  tourismPlaceId: number;
  distance: number;
  estimatedTime: string;
  routeDescription: string;
  majorLandmarks: string[];
  difficulty: "easy" | "medium" | "hard";
}

// ✅ MISSING - ADD THIS:
export interface DistanceInfoDto {
  from: string;
  to: string;
  distance: number;  // in km
  duration: string;  // "2 hours 30 mins"
}
