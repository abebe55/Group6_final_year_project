// frontend/src/types/rating.ts
export interface TourismRatingRequestDto {
  tourismPlaceId: number;
  rating: number; // 1-5
  comment?: string;
}

export interface TourismRatingResponseDto {
  id: number;
  rating: number;
  comment?: string;
  userFullName: string;  // ✅ Matches Java backend
  createdAt: string;
}
