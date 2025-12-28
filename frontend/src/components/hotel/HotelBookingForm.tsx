"use client";

import { useState } from "react";
import { bookHotel } from "@/services/hotel.service";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  hotelId: number;
  hotelName: string;
}

export default function HotelBookingForm({ hotelId, hotelName }: Props) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate) return alert("Select check-in and check-out dates.");
    if (!isAuthenticated || !token) return alert("You must be logged in to make a booking.");

    setLoading(true);
    try {
      const response = await bookHotel({ hotelId, checkInDate, checkOutDate } as any, token);
      // Backend returns booking info — show a friendly summary
      if (response && (response as any).bookingId) {
        setBookingStatus(`Booking successful! Booking ID: ${(response as any).bookingId}`);
      } else {
        setBookingStatus("Booking successful.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.body || err?.message || "Booking failed. Try again.";
      setBookingStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md shadow-md max-w-md">
      <h3 className="font-semibold mb-2">Book {hotelName}</h3>
      <div className="flex flex-col gap-2">
        <label>
          Check-in Date:
          <input
            type="date"
            value={checkInDate}
            onChange={e => setCheckInDate(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </label>
        <label>
          Check-out Date:
          <input
            type="date"
            value={checkOutDate}
            onChange={e => setCheckOutDate(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </label>
        <button
          onClick={handleBooking}
          disabled={loading}
          className="bg-green-700 text-white px-4 py-2 rounded mt-2 hover:bg-green-800 transition"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
        {bookingStatus && <p className="mt-2 text-gray-700 break-words">{bookingStatus}</p>}
      </div>
    </div>
  );
}
