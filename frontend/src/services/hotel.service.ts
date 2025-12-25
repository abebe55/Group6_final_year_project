// frontend/src/services/hotel.service.ts
import { HotelSummaryDto, HotelDetailInfoDto, HotelBookingResponseDto } from "../types/hotel";
import { API_BASE_URL } from "./api";
import { BookingRequestDto } from "../types/hotel";

export async function getHotelsByTourism(tourismId: number): Promise<HotelSummaryDto[]> {
  const res = await fetch(`${API_BASE_URL}/hotels/by-tourism/${tourismId}`);
  if (!res.ok) throw new Error("Failed to fetch hotels");
  return res.json();
}

export async function getHotelDetails(hotelId: number): Promise<HotelDetailInfoDto> {
  const res = await fetch(`${API_BASE_URL}/hotels/${hotelId}`);
  if (!res.ok) throw new Error("Failed to fetch hotel details");
  return res.json();
}

export async function bookHotel(request: BookingRequestDto, token: string): Promise<HotelBookingResponseDto> {
  const res = await fetch(`${API_BASE_URL}/hotels/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) throw new Error("Failed to book hotel");
  return res.json();
}

export async function rateHotel(hotelId: number, rating: number, comment: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/hotels/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hotelId, rating, comment }),
  });

  if (!res.ok) throw new Error("Failed to submit hotel rating");
  return res.json();
}

// Backwards-compatible aliases for files expecting these export names
export const fetchHotelDetail = getHotelDetails;

// NOTE: horse-related helpers live in `horse.service.ts`. We don't implement them here.
