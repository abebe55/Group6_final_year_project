// frontend/src/types/hotel.ts

export interface HotelSummaryDto {
  id: number;
  name: string;
  stars: number;
  imageUrl: string;
}

export interface HotelDetailInfoDto {
  id: number;
  name: string;
  description: string;
  stars: number;
  contactInfo: string;
  policies: string;
  images: string[];
  averageRating: number;
  ratings: HotelRatingResponseDto[];
}

export interface HotelRatingResponseDto {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface HotelBookingResponseDto {
  bookingId: number;
  hotelName: string;
  status: string;
}

export interface BookingRequestDto {
  hotelId: number;
  checkInDate: string; // ISO string
  checkOutDate: string; // ISO string
}
