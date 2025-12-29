export interface RoadInfoDto {
  id: number;

  initialPlace: string;
  roadType: string; // "CAR", "FOOT", "PLANE", "HORSE"
  description?: string;
  initialPlace?: string;
  description?: string;
  roadType?: string;

  distanceByCar?: number;
  distanceByFoot?: number;
  distanceByPlane?: number;
  distanceByHorse?: number;
  totalDistance?: number;
  
}
}