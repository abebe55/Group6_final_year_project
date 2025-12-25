"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchTourismDetail } from "@/services/tourism.service";
import { TourismFullDetailDto } from "@/types/tourism";
import LoginForm from "@/app/auth/login/page";
import Modal from "@/components/common/Modal";

export default function TourismDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourismId = Number(params.id);
  const { isAuthenticated, token } = useAuthStore();

  // States
  const [detail, setDetail] = useState<TourismFullDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);

  // Load detail
  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchTourismDetail(tourismId, token ?? undefined);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || "Failed to load tourism details");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [tourismId, token]);

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      setAuthModal(true);
      return;
    }
    // Handle authenticated actions
    console.log(`🔐 ${action} for tourism ${tourismId}`);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "hotels":
        router.push(`/hotels?tourismId=${tourismId}`);
        break;
      case "booking":
        requireAuth("Start Booking");
        break;
      case "tourism-rating":
        requireAuth("Rate Tourism");
        break;
      case "hotel-rating":
        requireAuth("Rate Hotel");
        break;
      case "road-info":
        requireAuth("View Road Info");
        break;
      case "horsers":
        requireAuth("View Horse Services");
        break;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Tourism place not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            {detail.name}
          </h1>
          <div className="flex flex-wrap gap-4 justify-center text-lg text-gray-600 mb-8">
            <span>{detail.wereda}, {detail.kebele}</span>
            <span>{detail.category}</span>
            <span>👁️ {detail.viewersCount.toLocaleString()} views</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images & Info */}
        <div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
            {detail.images && detail.images.length > 0 ? (
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={detail.images[0]}
                  alt={detail.name}
                  className="w-full h-full object-cover"
                />
                {detail.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-xl">
                    +{detail.images.length - 1} more photos
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                No images available
              </div>
            )}
          </div>

          {/* Key Info */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-3">Best Time to Visit</h3>
              <p className="text-lg text-gray-700">{detail.bestTime || "Year-round"}</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Languages Available</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.languages?.map((lang: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Peace & Safety</h3>
              <p className="text-lg text-gray-700">{detail.peaceInfo || "Safe destination"}</p>
            </div>
          </div>
        </div>

        {/* Description & Ratings */}
        <div className="space-y-8">
          {/* Description */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Description</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{detail.description}</p>
          </div>

          {/* Ratings Summary */}
          {detail.ratingSummary && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">★ {detail.ratingSummary.avgRating?.toFixed(1) || 0}</div>
                <div className="text-2xl">({detail.ratingSummary.totalRatings} reviews)</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionButton 
            icon="🏨" 
            title="Hotels" 
            subtitle="Nearby accommodations" 
            onClick={() => handleAction("hotels")}
          />
          <ActionButton 
            icon="📅" 
            title="Book Now" 
            subtitle="Reserve your visit" 
            onClick={() => handleAction("booking")}
          />
          <ActionButton 
            icon="⭐" 
            title="Rate Tourism" 
            subtitle="Share your experience" 
            onClick={() => handleAction("tourism-rating")}
          />
          <ActionButton 
            icon="🏨⭐" 
            title="Rate Hotels" 
            subtitle="Review your stay" 
            onClick={() => handleAction("hotel-rating")}
          />
          <ActionButton 
            icon="🛣️" 
            title="Road Info" 
            subtitle="Travel directions" 
            onClick={() => handleAction("road-info")}
          />
          <ActionButton 
            icon="🐎" 
            title="Horse Services" 
            subtitle="Guided horse tours" 
            onClick={() => handleAction("horsers")}
          />
        </div>
      </div>

      {/* Auth Modal */}
      <Modal isOpen={authModal} onClose={() => setAuthModal(false)}>
        <LoginForm 
          onSuccess={() => {
            setAuthModal(false);
            router.refresh(); // Reload data with auth
          }}
        />
      </Modal>
    </div>
  );
}

// Action Button Component
function ActionButton({ icon, title, subtitle, onClick }: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  onClick: () => void; 
}) {
  return (
    <div 
      className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center border-4 border-transparent hover:border-emerald-200"
      onClick={onClick}
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
}
