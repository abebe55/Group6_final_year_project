"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchTourismDetail } from "@/services/tourism.service";
import { TourismFullDetailDto } from "@/types/tourism";
import LoginForm from "@/app/auth/login/page";
import Modal from "@/components/common/Modal";
import TourismRatingModal from "@/components/tourism/TourismRatingModal";
import RatingsViewModal from "@/components/common/RatingsViewModal"; // ✅ New modal

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
  const [ratingModalOpen, setRatingModalOpen] = useState(false); // Submit rating
  const [ratingsViewOpen, setRatingsViewOpen] = useState(false); // View ratings

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
      return false;
    }
    return true;
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "hotels":
        router.push(`/hotels?tourismId=${tourismId}`);
        break;
      case "tourism-rating":
        if (requireAuth("Rate Tourism")) setRatingModalOpen(true);
        break;
      case "view-ratings":
        setRatingsViewOpen(true);
        break;
      case "road-info":
        router.push(`/roads?tourismId=${tourismId}`);
        break;
      case "booking":
      case "hotel-rating":
      case "horsers":
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
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-2xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">★ {detail.ratingSummary.avgRating?.toFixed(1) || 0}</div>
                <div className="text-2xl">({detail.ratingSummary.totalRatings} reviews)</div>
              </div>
              <button
                className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100"
                onClick={() => handleAction("view-ratings")}
              >
                View Ratings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PrimaryActionButton 
            icon="🏨" 
            title="Hotels" 
            subtitle="View accommodations" 
            onClick={() => handleAction("hotels")}
          />
          <PrimaryActionButton 
            icon="🛣️" 
            title="Road Info" 
            subtitle="Travel directions" 
            onClick={() => handleAction("road-info")}
          />
          <PrimaryActionButton 
            icon="⭐" 
            title="Rate Tourism" 
            subtitle="Share your experience" 
            onClick={() => handleAction("tourism-rating")}
          />
        </div>
      </div>

      {/* Auth Modal */}
      <Modal isOpen={authModal} onClose={() => setAuthModal(false)}>
        <LoginForm 
          onSuccess={() => {
            setAuthModal(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Submit Rating Modal */}
      <TourismRatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={(rating, comment) => {
          console.log("Rating submitted:", rating, comment);
          // TODO: Call API to submit rating
          setRatingModalOpen(false);
          alert("Thank you for your review!");
        }}
      />

      {/* View Ratings Modal */}
     {/* View Ratings Modal */}
<RatingsViewModal
  isOpen={ratingsViewOpen}
  onClose={() => setRatingsViewOpen(false)}
  fetchUrl={`http://localhost:8080/api/ratings/tourism/${tourismId}`}
  token={token ?? undefined}           // <-- null → undefined
  title={detail?.name ?? "Tourism Ratings"} // <-- null → fallback string
/>

    </div>
  );
}

// ✅ Primary Action Button Component
function PrimaryActionButton({ 
  icon, 
  title, 
  subtitle, 
  onClick 
}: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  onClick: () => void; 
}) {
  return (
    <div 
      className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 cursor-pointer h-full flex flex-col items-center text-center border-4 border-white/20 hover:border-white/50 backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-3xl font-black mb-3 drop-shadow-lg">{title}</h3>
      <p className="text-lg opacity-90 leading-relaxed drop-shadow-md">{subtitle}</p>
    </div>
  );
}
