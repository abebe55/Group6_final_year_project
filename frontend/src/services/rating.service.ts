import { TourismRatingRequestDto } from "../types/tourism";
import { API_BASE_URL } from "./api";

export async function addTourismRating(dto: TourismRatingRequestDto, token: string) {
  const res = await fetch(`${API_BASE_URL}/tourisms/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) throw new Error("Failed to add tourism rating");
  return res.json();
}

export async function getTourismRatings(tourismPlaceId: number) {
  const res = await fetch(`${API_BASE_URL}/tourisms/${tourismPlaceId}/ratings`);
  if (!res.ok) throw new Error("Failed to fetch tourism ratings");
  return res.json();
}
