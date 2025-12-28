import { API_BASE_URL } from "./api";
import { TourismImageDto } from "@/types/tourismImage";

// Public endpoint to get tourism images
export async function getTourismImages(tourismId: number): Promise<TourismImageDto[]> {
  const response = await fetch(`${API_BASE_URL}/tourisms/${tourismId}/images`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch tourism images");
  }
  
  return response.json();
}
