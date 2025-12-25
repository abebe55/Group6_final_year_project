"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import TopBar from "@/components/layout/TopBar";
import HotelDetail from "@/components/hotel/HotelDetail";
import HotelBookingForm from "@/components/hotel/HotelBookingForm";
import { fetchHotelDetail } from "@/services/hotel.service";
import { HotelDetailInfoDto } from "@/types/hotel";

export default function HotelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelDetailInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  const loadHotel = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await fetchHotelDetail(Number(id));
      setHotel(data);
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/auth/login/page");
      else console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!hotel) return <div className="text-center py-20">Hotel not found.</div>;

  return (
    <ProtectedRoute>
      <div className="px-6 py-6">
        <TopBar />

        <HotelDetail hotel={hotel} />

        <div className="mt-6">
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition"
          >
            {showBooking ? "Close Booking Form" : "Book This Hotel"}
          </button>

          {showBooking && hotel.id && (
            <div className="mt-4">
              <HotelBookingForm hotelId={hotel.id} hotelName={hotel.name} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
