"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchTourismDetail } from "@/services/tourism.service";
import { submitTourismRating, submitHotelRating } from "@/services/rating.service";
import { getHotelsByTourism } from "@/services/hotel.service";
import { getRoadsByTourism } from "@/services/road.service";
import { getHorseServicesByRoad } from "@/services/horse.service";
import { TourismFullDetailDto } from "@/types/tourism";
import { HotelSummaryDto } from "@/types/hotel";
import { RoadInfoDto } from "@/types/road";
import { HorseServiceSummaryDto } from "@/types/horse";
import { LanguageGuiderDto } from "@/types/guider";
import { getGuidersByTourism } from "@/services/guider.service";
import LoginForm from "@/app/auth/login/page";
import RegisterForm from "@/app/auth/register/page";
import Modal from "@/components/common/Modal";
import TourismRatingModal from "@/components/tourism/TourismRatingModal";
import HotelRatingModal from "@/components/hotel/HotelRatingModal";
import RatingsViewModal from "@/components/common/RatingsViewModal";
import TourismImageGallery from "@/components/tourism/TourismImageGallery";
import { API_BASE_URL } from "@/services/api";
import Image from "next/image";
import dynamic from "next/dynamic";

const RoadMapModal = dynamic(() => import("@/components/map/RoadMapModal"), { ssr: false });

type TabType = 'overview' | 'nearby' | 'hotels' | 'roads' | 'guiders';

export default function TourismDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourismId = Number(params.id);
  const { isAuthenticated, token, userId, username } = useAuthStore();

  // Main state
  const [detail, setDetail] = useState<TourismFullDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hotels state
  const [hotels, setHotels] = useState<HotelSummaryDto[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);

  // Roads state
  const [roads, setRoads] = useState<RoadInfoDto[]>([]);
  const [roadsLoading, setRoadsLoading] = useState(false);
  const [horseServices, setHorseServices] = useState<Record<number, HorseServiceSummaryDto[]>>({});
  const [expandedHorseServices, setExpandedHorseServices] = useState<Record<number, boolean>>({});
  const [loadingHorseServices, setLoadingHorseServices] = useState<Record<number, boolean>>({});
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState<RoadInfoDto | null>(null);

  // Guiders state
  const [guiders, setGuiders] = useState<LanguageGuiderDto[]>([]);
  const [guidersLoading, setGuidersLoading] = useState(false);

  // Image gallery state
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  // Modal states
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingsViewOpen, setRatingsViewOpen] = useState(false);
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);
  
  // Hotel rating states
  const [hotelRatingModalOpen, setHotelRatingModalOpen] = useState(false);
  const [hotelRatingsViewOpen, setHotelRatingsViewOpen] = useState(false);
  const [ratingHotelId, setRatingHotelId] = useState<number | null>(null);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchTourismDetail(tourismId, token ?? undefined);
      setDetail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tourism details");
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    if (hotels.length > 0) return;
    try {
      setHotelsLoading(true);
      const data = await getHotelsByTourism(tourismId, token);
      setHotels(data);
    } catch (err) {
      console.error("Failed to load hotels:", err);
    } finally {
      setHotelsLoading(false);
    }
  };

  const loadRoads = async () => {
    if (roads.length > 0) return;
    try {
      setRoadsLoading(true);
      const data = await getRoadsByTourism(tourismId);
      setRoads(data);
    } catch (err) {
      console.error("Failed to load roads:", err);
    } finally {
      setRoadsLoading(false);
    }
  };

  const loadGuiders = async () => {
    if (guiders.length > 0) return;
    try {
      setGuidersLoading(true);
      const data = await getGuidersByTourism(tourismId);
      setGuiders(data);
    } catch (err) {
      console.error("Failed to load guiders:", err);
    } finally {
      setGuidersLoading(false);
    }
  };

  useEffect(() => { loadDetail(); loadGuiders(); }, [tourismId, token]);
  useEffect(() => {
    if (activeTab === 'hotels') loadHotels();
    if (activeTab === 'roads') loadRoads();
    if (activeTab === 'guiders') loadGuiders();
  }, [activeTab]);

  const requireAuth = () => {
    if (!isAuthenticated) { setAuthMode('login'); setAuthModal(true); return false; }
    return true;
  };

  const handleSubmitTourismRating = async (rating: number, comment: string) => {
    if (!token) return;
    try {
      await submitTourismRating(tourismId, rating, comment || undefined, token);
      setRatingModalOpen(false);
      setRatingsRefreshKey(prev => prev + 1);
      await loadDetail();
      alert("Thank you for your review!");
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed to submit rating"); }
  };

  const handleSubmitHotelRating = async (rating: number, comment: string) => {
    if (!token || !ratingHotelId) return;
    try {
      await submitHotelRating(ratingHotelId, rating, comment || undefined, token);
      setHotelRatingModalOpen(false);
      await loadHotels();
      alert("Thank you for your review!");
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed to submit rating"); }
  };

  const toggleHorseServices = async (roadId: number) => {
    if (expandedHorseServices[roadId]) {
      setExpandedHorseServices(prev => ({ ...prev, [roadId]: false }));
      return;
    }
    if (!horseServices[roadId]) {
      setLoadingHorseServices(prev => ({ ...prev, [roadId]: true }));
      try {
        const services = await getHorseServicesByRoad(roadId);
        setHorseServices(prev => ({ ...prev, [roadId]: services }));
      } catch (err) { setHorseServices(prev => ({ ...prev, [roadId]: [] })); }
      finally { setLoadingHorseServices(prev => ({ ...prev, [roadId]: false })); }
    }
    setExpandedHorseServices(prev => ({ ...prev, [roadId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading Destination...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 shadow-md">
          <div className="text-5xl mb-4">🏞️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Destination Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push('/tourisms')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            ← Back to Destinations
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'nearby', label: 'Nearby Places', icon: '📍', count: detail?.nearbyPlaces?.length || 0 },
    { id: 'hotels', label: 'Hotels', icon: '🏨', count: hotels.length },
    { id: 'roads', label: 'Roads & Transport', icon: '🛣️', count: roads.length },
    { id: 'guiders', label: 'Language Guiders', icon: '🗣️', count: guiders.length },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 md:hidden bg-gray-800 p-2 rounded-lg border border-gray-700 text-white text-sm"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Back Button */}
          <div className="p-4 border-b border-gray-700">
            <button onClick={() => router.push('/tourisms')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Destinations
            </button>
          </div>

          {/* Tourism Mini Card */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative h-24 rounded-lg overflow-hidden mb-3">
              <Image src={detail.images?.[0] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"} alt={detail.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <h2 className="text-white font-semibold text-sm truncate">{detail.name}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
              <span>📍 {detail.wereda}</span>
              {detail.ratingSummary && <span className="text-yellow-400">⭐ {detail.ratingSummary.avgRating?.toFixed(1) || 0}</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="text-gray-500 text-xs font-medium uppercase px-2 mb-2">Navigation</p>
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as TabType); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === item.id ? 'bg-white/20' : 'bg-gray-700'}`}>{item.count}</span>
                )}
              </button>
            ))}

            <div className="pt-4">
              <p className="text-gray-500 text-xs font-medium uppercase px-2 mb-2">Quick Actions</p>
              <button onClick={() => setImageGalleryOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 border border-emerald-600/50">
                <span>📸</span><span>View Internal Images</span>
              </button>
              <button onClick={() => requireAuth() && setRatingModalOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 mt-1">
                <span>⭐</span><span>Rate This Place</span>
              </button>
              <button onClick={() => setRatingsViewOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                <span>📝</span><span>View All Reviews</span>
              </button>
              <button onClick={() => setActiveTab('nearby')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                <span>📍</span><span>Nearby Places</span>
              </button>
              <button onClick={() => setActiveTab('hotels')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                <span>🏨</span><span>Find Hotels</span>
              </button>
              <button onClick={() => setActiveTab('roads')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                <span>🗺️</span><span>View Routes</span>
              </button>
              <button onClick={() => setActiveTab('guiders')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                <span>🗣️</span><span>Find Guiders</span>
              </button>
            </div>
          </nav>

          {/* User Info */}
          <div className="p-3 border-t border-gray-700">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{username}</p>
                  <p className="text-gray-500 text-xs">Logged in</p>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); setAuthModal(true); }} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Login to Rate
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-60 min-h-screen">
        {/* Hero Header */}
        <div className="relative h-48 md:h-64">
          <Image src={detail.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"} alt={detail.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          
          {detail.images && detail.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {detail.images.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{detail.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="bg-gray-800/80 px-3 py-1 rounded-full text-gray-300">📍 {detail.wereda}, {detail.kebele}</span>
              <span className="bg-gray-800/80 px-3 py-1 rounded-full text-gray-300">🏷️ {detail.category}</span>
              <span className="bg-gray-800/80 px-3 py-1 rounded-full text-gray-300">👁️ {detail.viewersCount.toLocaleString()} views</span>
              {detail.ratingSummary && (
                <span className="bg-yellow-600/80 px-3 py-1 rounded-full text-white font-medium">
                  ⭐ {detail.ratingSummary.avgRating?.toFixed(1) || 0} ({detail.ratingSummary.totalRatings} reviews)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl mb-2">🏞️</div>
                  <h3 className="text-white font-medium text-sm mb-1">About This Place</h3>
                  <p className="text-gray-400 text-sm">{detail.description || "A beautiful destination waiting to be explored."}</p>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl mb-2">🕐</div>
                  <h3 className="text-white font-medium text-sm mb-1">Best Time to Visit</h3>
                  <p className="text-gray-400 text-sm">{detail.bestTime || "Year-round destination"}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl mb-2">⏱️</div>
                  <h3 className="text-white font-medium text-sm mb-1">Visit Duration</h3>
                  <p className="text-gray-400 text-sm">{detail.visitTime || "2-3 hours recommended"}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h3 className="text-white font-medium text-sm mb-1">Safety Info</h3>
                  <p className="text-gray-400 text-sm">{detail.peaceInfo || "Safe and welcoming destination"}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl mb-2">🗣️</div>
                  <h3 className="text-white font-medium text-sm mb-1">Languages</h3>
                  <div className="flex flex-wrap gap-1">
                    {detail.languages?.length > 0 ? detail.languages.map((lang, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded text-xs">{lang}</span>
                    )) : <span className="text-gray-400 text-sm">Local languages spoken</span>}
                  </div>
                </div>

                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/50">
                  <div className="text-2xl mb-2">⭐</div>
                  <h3 className="text-white font-medium text-sm mb-1">Rating</h3>
                  <div className="text-2xl font-bold text-blue-400">{detail.ratingSummary?.avgRating?.toFixed(1) || '0'}/5</div>
                  <p className="text-gray-400 text-xs">{detail.ratingSummary?.totalRatings || 0} reviews</p>
                </div>
              </div>

              {detail.images && detail.images.length > 1 && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">📸 Gallery</h3>
                    <button
                      onClick={() => setImageGalleryOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <span>📸</span> View All Internal Images
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {detail.images.map((img, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`relative h-16 md:h-20 rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-600'}`}>
                        <Image src={img} alt={`${detail.name} ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Images Button - Always visible */}
              {(!detail.images || detail.images.length <= 1) && (
                <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">📸</div>
                      <div>
                        <h3 className="text-emerald-300 font-medium">Internal Images</h3>
                        <p className="text-gray-400 text-sm">Explore detailed photos of different areas within this place</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setImageGalleryOpen(true)}
                      className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      View Gallery
                    </button>
                  </div>
                </div>
              )}

              {/* Language Guiders Section - Always visible */}
              <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🗣️</div>
                    <div>
                      <h3 className="text-green-300 font-medium">Language Guiders</h3>
                      <p className="text-gray-400 text-sm">
                        {guidersLoading ? 'Loading guiders...' : 
                          guiders.length > 0 
                            ? `${guiders.length} local guide${guiders.length !== 1 ? 's' : ''} available to help you explore`
                            : 'Find local guides who speak your language'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('guiders')}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    {guiders.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{guiders.length}</span>
                    )}
                    View Guiders
                  </button>
                </div>
              </div>

              {/* Nearby Places Preview */}
              {detail.nearbyPlaces && detail.nearbyPlaces.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">📍 Nearby Places in {detail.kebele}</h3>
                    <button onClick={() => setActiveTab('nearby')} className="text-green-400 text-xs hover:text-green-300">
                      View All ({detail.nearbyPlaces.length}) →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {detail.nearbyPlaces.slice(0, 3).map((place) => (
                      <div 
                        key={place.id} 
                        onClick={() => router.push(`/tourisms/${place.id}`)}
                        className="relative h-20 rounded-lg overflow-hidden cursor-pointer group"
                      >
                        {place.imageUrl ? (
                          <Image src={place.imageUrl} alt={place.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
                            <span className="text-2xl">🏞️</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-1 left-1 right-1">
                          <p className="text-white text-xs font-medium truncate">{place.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-600 rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Ready to Explore?</h3>
                <p className="text-blue-100 text-sm mb-4">Find accommodations and plan your route to {detail.name}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => setActiveTab('hotels')} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">🏨 Find Hotels</button>
                  <button onClick={() => setActiveTab('roads')} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">🗺️ View Routes</button>
                </div>
              </div>
            </div>
          )}

          {/* Nearby Places Tab */}
          {activeTab === 'nearby' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Nearby Tourism Places</h2>
                <p className="text-gray-400 text-sm">Explore other destinations in {detail.kebele} kebele</p>
              </div>
              
              {!detail.nearbyPlaces || detail.nearbyPlaces.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="text-lg font-medium text-white mb-1">No Nearby Places Found</h3>
                  <p className="text-gray-400 text-sm">There are no other tourism places in this kebele yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detail.nearbyPlaces.map((place) => (
                    <div 
                      key={place.id} 
                      onClick={() => router.push(`/tourisms/${place.id}`)}
                      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-green-500/50 transition cursor-pointer group"
                    >
                      <div className="relative h-36">
                        {place.imageUrl ? (
                          <Image src={place.imageUrl} alt={place.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
                            <span className="text-4xl">🏞️</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-medium text-sm truncate">{place.name}</h3>
                          {place.category && (
                            <span className="text-green-300 text-xs">🏷️ {place.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">📍 Same Kebele</span>
                          <span className="text-green-400 text-xs font-medium group-hover:text-green-300">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detail.nearbyPlaces && detail.nearbyPlaces.length > 0 && (
                <div className="mt-6 bg-green-900/30 rounded-xl p-4 border border-green-700/50">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h4 className="text-green-300 font-medium text-sm">Plan Your Trip</h4>
                      <p className="text-gray-400 text-xs">These places are in the same kebele as {detail.name}. Consider visiting multiple destinations in one trip!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div>
              {hotelsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-400 text-sm">Loading hotels...</p>
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-4xl mb-3">🏨</div>
                  <h3 className="text-lg font-medium text-white mb-1">No Hotels Found</h3>
                  <p className="text-gray-400 text-sm">No accommodations available for this destination yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition">
                      <div className="relative h-36">
                        {hotel.imageUrl ? (
                          <Image src={hotel.imageUrl} alt={hotel.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center"><span className="text-4xl">🏨</span></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-yellow-400 text-sm">{'★'.repeat(hotel.stars || 3)}{'☆'.repeat(5 - (hotel.stars || 3))}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-medium mb-3">{hotel.name}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/hotels/${hotel.id}`)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                            Book Now
                          </button>
                          <button onClick={() => { if (requireAuth()) { setRatingHotelId(hotel.id); setHotelRatingModalOpen(true); } }} className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700" title="Rate Hotel">
                            ⭐ Rate
                          </button>
                          <button onClick={() => { setRatingHotelId(hotel.id); setHotelRatingsViewOpen(true); }} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600" title="View Reviews">
                            📝 Reviews
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roads Tab */}
          {activeTab === 'roads' && (
            <div>
              {roadsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-400 text-sm">Loading routes...</p>
                </div>
              ) : roads.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-4xl mb-3">🛣️</div>
                  <h3 className="text-lg font-medium text-white mb-1">No Routes Found</h3>
                  <p className="text-gray-400 text-sm">Road information for this destination is being prepared.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-medium border border-blue-700/50">🚗 {roads.filter(r => r.distanceByCar).length} Drive Routes</span>
                    <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-xs font-medium border border-green-700/50">🚶 {roads.filter(r => r.distanceByFoot).length} Walking Routes</span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium border border-purple-700/50">🐎 {roads.filter(r => r.distanceByHorse).length} Horse Routes</span>
                  </div>

                  {roads.map((road) => (
                    <div key={road.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <div className={`p-4 border-b border-gray-700 ${
                        road.roadType === 'CAR' ? 'bg-blue-900/30' : road.roadType === 'FOOT' ? 'bg-green-900/30' : road.roadType === 'HORSE' ? 'bg-purple-900/30' : 'bg-orange-900/30'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{road.roadType === 'CAR' ? '🚗' : road.roadType === 'FOOT' ? '🚶' : road.roadType === 'HORSE' ? '🐎' : '✈️'}</span>
                            <div>
                              <h3 className="text-white font-medium">{road.roadType} Route</h3>
                              <p className="text-gray-400 text-sm">From {road.initialPlace}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-400">{road.totalDistance?.toFixed(1) || '—'}</div>
                            <div className="text-xs text-gray-400">km total</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        {road.description && <p className="text-gray-400 text-sm mb-4">{road.description}</p>}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                          {road.distanceByCar && (
                            <div className="bg-blue-900/20 border border-blue-700/30 p-3 rounded-lg text-center">
                              <div className="text-lg mb-1">🚗</div>
                              <div className="text-lg font-bold text-blue-400">{road.distanceByCar.toFixed(1)}</div>
                              <div className="text-xs text-gray-400">km by car</div>
                            </div>
                          )}
                          {road.distanceByFoot && (
                            <div className="bg-green-900/20 border border-green-700/30 p-3 rounded-lg text-center">
                              <div className="text-lg mb-1">🚶</div>
                              <div className="text-lg font-bold text-green-400">{road.distanceByFoot.toFixed(1)}</div>
                              <div className="text-xs text-gray-400">km on foot</div>
                            </div>
                          )}
                          {road.distanceByHorse && (
                            <div className="bg-purple-900/20 border border-purple-700/30 p-3 rounded-lg text-center">
                              <div className="text-lg mb-1">🐎</div>
                              <div className="text-lg font-bold text-purple-400">{road.distanceByHorse.toFixed(1)}</div>
                              <div className="text-xs text-gray-400">km by horse</div>
                            </div>
                          )}
                          {road.distanceByPlane && (
                            <div className="bg-orange-900/20 border border-orange-700/30 p-3 rounded-lg text-center">
                              <div className="text-lg mb-1">✈️</div>
                              <div className="text-lg font-bold text-orange-400">{road.distanceByPlane.toFixed(1)}</div>
                              <div className="text-xs text-gray-400">km by plane</div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedRoad(road); setMapModalOpen(true); }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1">
                            🗺️ View on Map
                          </button>
                          <button onClick={() => toggleHorseServices(road.id)} disabled={loadingHorseServices[road.id]} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1">
                            🐎 Horse Services
                            {loadingHorseServices[road.id] ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (
                              <svg className={`w-3 h-3 transition-transform ${expandedHorseServices[road.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {expandedHorseServices[road.id] && (
                          <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                            <h4 className="text-purple-300 font-medium text-sm mb-3">🐎 Available Horse Services</h4>
                            {horseServices[road.id]?.length > 0 ? (
                              <div className="space-y-2">
                                {horseServices[road.id].map((service) => (
                                  <div key={service.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="text-white font-medium text-sm">{service.ownerName}</h5>
                                        <p className="text-purple-300 text-xs">📍 {service.initialPlace}</p>
                                        <p className="text-gray-400 text-xs">📞 {service.contactInfo}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-green-400">{service.cost.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">ETB</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="text-3xl mb-2">🐎</div>
                                <p className="text-purple-300/70 text-sm">No horse services available for this route yet.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guiders Tab */}
          {activeTab === 'guiders' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Language Guiders</h2>
                <p className="text-gray-400 text-sm">Local guides who can help you explore {detail.name} in your preferred language</p>
              </div>
              
              {guidersLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-400 text-sm">Loading guiders...</p>
                </div>
              ) : guiders.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="text-4xl mb-3">🗣️</div>
                  <h3 className="text-lg font-medium text-white mb-1">No Guiders Available</h3>
                  <p className="text-gray-400 text-sm">No language guiders have been registered for this destination yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-xs font-medium border border-green-700/50">
                      🗣️ {guiders.length} Guider{guiders.length !== 1 ? 's' : ''} Available
                    </span>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-medium border border-blue-700/50">
                      🌍 {[...new Set(guiders.flatMap(g => g.languages))].length} Languages Supported
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guiders.map((guider) => (
                      <div key={guider.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-green-500/50 transition">
                        <div className="p-4 bg-green-900/30 border-b border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {guider.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{guider.fullName}</h3>
                              <p className="text-green-300 text-sm">Language Guider</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Contact</p>
                            <p className="text-gray-300 text-sm flex items-center gap-2">
                              <span>📞</span> {guider.contactInfo}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-2">Languages Spoken</p>
                            <div className="flex flex-wrap gap-1">
                              {guider.languages.map((lang, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2">
                            <span className={`px-2 py-1 rounded text-xs ${guider.active ? 'bg-green-600/30 text-green-300' : 'bg-gray-600/30 text-gray-400'}`}>
                              {guider.active ? '✓ Available' : '✗ Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-green-900/30 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <h4 className="text-green-300 font-medium text-sm">Hire a Local Guide</h4>
                        <p className="text-gray-400 text-xs">Contact any of the guiders above to arrange a guided tour in your preferred language. They can help you discover hidden gems and local culture!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal with Login/Register switching */}
      <Modal isOpen={authModal} onClose={() => setAuthModal(false)}>
        {authMode === 'login' ? (
          <LoginForm onSuccess={() => { setAuthModal(false); router.refresh(); }} onRegisterClick={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSuccess={() => { setAuthModal(false); }} onLoginClick={() => setAuthMode('login')} />
        )}
      </Modal>

      <TourismRatingModal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={detail?.name} onSubmit={handleSubmitTourismRating} />

      <RatingsViewModal isOpen={ratingsViewOpen} onClose={() => setRatingsViewOpen(false)} fetchUrl={`${API_BASE_URL}/ratings/tourism/${tourismId}`} token={token ?? undefined} title={detail?.name ?? "Tourism Ratings"} refreshKey={ratingsRefreshKey} />

      {ratingHotelId && (
        <>
          <HotelRatingModal isOpen={hotelRatingModalOpen} hotelId={ratingHotelId} hotelName={hotels.find(h => h.id === ratingHotelId)?.name || "Hotel"} onClose={() => setHotelRatingModalOpen(false)} onSubmit={handleSubmitHotelRating} />
          <RatingsViewModal isOpen={hotelRatingsViewOpen} onClose={() => setHotelRatingsViewOpen(false)} fetchUrl={`${API_BASE_URL}/ratings/hotel/${ratingHotelId}`} token={token ?? undefined} title={hotels.find(h => h.id === ratingHotelId)?.name || "Hotel Ratings"} refreshKey={0} />
        </>
      )}

      {selectedRoad && (
        <RoadMapModal isOpen={mapModalOpen} onClose={() => { setMapModalOpen(false); setSelectedRoad(null); }} roadId={selectedRoad.id} tourismId={tourismId} roadType={selectedRoad.roadType} initialPlace={selectedRoad.initialPlace} destinationName={detail?.name || "Destination"} />
      )}

      {/* Tourism Internal Images Gallery */}
      <TourismImageGallery
        tourismId={tourismId}
        tourismName={detail?.name || "Tourism Place"}
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
      />
    </div>
  );
}
