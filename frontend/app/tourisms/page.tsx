"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import LoginForm from "@/app/auth/login/page";
import RegisterForm from "@/app/auth/register/page";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { fetchTourismPlaces } from "@/services/tourism.service";
import { useAuthStore } from "@/store/useAuthStore";

export interface TourismPublicCard {
  id: number;
  name: string;
  imageUrl?: string;
  viewersCount: number;
  category?: string;
  wereda?: string;
  description?: string;
}

const CATEGORIES = [
  { id: "HERITAGE", icon: "🕌", label: "Heritage" },
  { id: "HIGHLAND", icon: "⛰️", label: "Highland" },
  { id: "CAVERN", icon: "🕳️", label: "Cavern" },
  { id: "AQUATICS", icon: "🌊", label: "Aquatics" },
  { id: "CULTURE", icon: "🎭", label: "Culture" },
  { id: "MODERN", icon: "🏛️", label: "Modern" },
];

export default function TourismListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("categories") || "";
  const keywordParam = searchParams.get("keyword") || "";
  const sortByParam = searchParams.get("sortBy") || "viewersCount";
  const sortDirParam = searchParams.get("sortDir") || "desc";
  const initialCategories = categoryParam ? categoryParam.split(",") : [];

  // States
  const [tourismPlaces, setTourismPlaces] = useState<TourismPublicCard[]>([]);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [currentKeyword, setCurrentKeyword] = useState(keywordParam);
  const [sortBy, setSortBy] = useState(sortByParam);
  const [sortDir, setSortDir] = useState(sortDirParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // Auth state
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalContent, setAuthModalContent] = useState<"login" | "register" | null>(null);
  const [pendingNavId, setPendingNavId] = useState<number | null>(null);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const [navError, setNavError] = useState<string | null>(null);

  // Fetch places
  const fetchPlaces = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTourismPlaces({ 
        categories, 
        keyword: currentKeyword,
        page,
        size: pageSize,
        sortBy,
        sortDir
      });

      const formattedPlaces = (response?.content || []).map((place: any) => ({
        id: place.id ?? 0,
        name: place.name ?? "Unknown",
        imageUrl: place.imageUrl ?? "/images/placeholder.jpg",
        viewersCount: place.viewersCount ?? 0,
        category: place.category,
        wereda: place.wereda,
        description: place.description,
      }));

      setTourismPlaces(formattedPlaces);
      setCurrentPage(response.number ?? 0);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to fetch tourism places:", err);
      setError("Failed to load destinations. Please try again.");
      setTourismPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [categories, currentKeyword, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchPlaces(0);
  }, [categories.join(","), currentKeyword, pageSize, sortBy, sortDir, fetchPlaces]);

  const handleCategoryToggle = useCallback((category: string) => {
    setCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      return newCategories;
    });
  }, []);

  // Update URL when categories change (separate from state update to avoid React warning)
  useEffect(() => {
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    }
    if (currentKeyword.trim()) {
      params.set("keyword", currentKeyword);
    }
    if (sortBy !== "viewersCount") {
      params.set("sortBy", sortBy);
    }
    if (sortDir !== "desc") {
      params.set("sortDir", sortDir);
    }
    const newUrl = params.toString() ? `/tourisms?${params.toString()}` : "/tourisms";
    router.replace(newUrl, { scroll: false });
  }, [categories, currentKeyword, sortBy, sortDir, router]);

  const handleSearch = useCallback((keyword: string) => {
    setCurrentKeyword(keyword);
    // URL update is handled by the useEffect above
  }, []);

  const handlePageChange = useCallback((page: number) => {
    fetchPlaces(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPlaces]);

  // Navigation
  const navigateWithFeedback = async (tourismId: number) => {
    setNavError(null);
    setNavigatingId(tourismId);
    try {
      router.push(`/tourisms/${tourismId}`);
    } catch (err: any) {
      console.error("Navigation failed:", err);
      setNavError("Unable to open details. Please try again.");
    } finally {
      setNavigatingId(null);
    }
  };

  const requireAuthThenNavigate = (tourismId: number) => {
    if (isAuthenticated) {
      navigateWithFeedback(tourismId);
      return;
    }
    setPendingNavId(tourismId);
    setAuthModalContent("login");
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null);
      setTimeout(() => navigateWithFeedback(id), 500);
    }
  };

  const handleRegisterSuccess = () => {
    setAuthModalOpen(false);
    setAuthModalContent(null);
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null);
      setTimeout(() => navigateWithFeedback(id), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-900/30 via-transparent to-transparent"></div>
      </div>
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <TopBar 
        keyword={currentKeyword} 
        onSearch={handleSearch}
        showCategories={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Header Row - All info side by side */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Left: Back & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Link href="/" className="text-slate-500 hover:text-emerald-400">Home</Link>
              <span className="text-slate-600">/</span>
              <span className="text-emerald-400 font-medium">Tourism Places</span>
            </div>
          </div>

          {/* Center: Title & Count */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-bold text-white">
              {categories.length > 0 
                ? `${categories.map(c => CATEGORIES.find(cat => cat.id === c)?.label || c).join(", ")}`
                : currentKeyword
                  ? `"${currentKeyword}"`
                  : "All Destinations"
              }
            </h1>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
              {totalElements} found
            </span>
          </div>

          {/* Right: Sort (optional) */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-slate-500">Sort:</span>
            <select 
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [newSortBy, newSortDir] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortDir(newSortDir);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="viewersCount-desc">Most Popular</option>
              <option value="viewersCount-asc">Least Popular</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills - Compact */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                categories.includes(cat.id)
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {categories.includes(cat.id) && (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          ))}
          {categories.length > 0 && (
            <button
              onClick={() => {
                setCategories([]);
                router.replace("/tourisms", { scroll: false });
              }}
              className="px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-between">
            <p className="text-sm font-medium text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 font-medium text-sm">
              Dismiss
            </button>
          </div>
        )}

        {/* Tourism Grid - 4 Columns */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(pageSize).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-800/80 rounded-2xl shadow-md overflow-hidden animate-pulse border border-slate-700/50">
                <div className="h-44 bg-slate-700" />
                <div className="p-4">
                  <div className="h-5 bg-slate-700 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tourismPlaces.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Destinations Found</h2>
            <p className="text-slate-400 mb-6">Try adjusting your search or category filters.</p>
            <button
              onClick={() => {
                setCategories([]);
                setCurrentKeyword("");
                router.replace("/tourisms", { scroll: false });
              }}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View All Places
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tourismPlaces.map((tourism) => (
              <TourismCard
                key={tourism.id}
                tourism={tourism}
                isNavigating={navigatingId === tourism.id}
                onClick={() => requireAuthThenNavigate(tourism.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalElements > 0 && (
          <div className="mt-8 pb-6 bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-md p-4 border border-slate-700/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => { setPageSize(size); fetchPlaces(0); }}
              pageSizeOptions={[8, 12, 16, 20, 24]}
            />
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <Modal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); setPendingNavId(null); setAuthModalContent(null); }}>
        {authModalContent === "login" && (
          <LoginForm 
            onSuccess={handleLoginSuccess} 
            onRegisterClick={() => setAuthModalContent("register")} 
          />
        )}
        {authModalContent === "register" && (
          <RegisterForm 
            onSuccess={handleRegisterSuccess} 
            onLoginClick={() => setAuthModalContent("login")} 
          />
        )}
      </Modal>

      {navError && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 max-w-sm">
          {navError}
        </div>
      )}

      {/* CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}

// Tourism Card Component
function TourismCard({ 
  tourism, 
  isNavigating, 
  onClick 
}: { 
  tourism: TourismPublicCard; 
  isNavigating: boolean;
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="group bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 border border-slate-700/50 hover:border-emerald-500/50"
    >
      <div className="relative h-44 overflow-hidden bg-slate-700">
        <img
          src={tourism.imageUrl}
          alt={tourism.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {tourism.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-emerald-400 rounded-full text-xs font-semibold">
            {tourism.category}
          </span>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs">
          <span>👁️</span>
          <span>{tourism.viewersCount.toLocaleString()}</span>
        </div>
        {isNavigating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
          {tourism.name}
        </h3>
        {tourism.wereda && (
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <span>📍</span> {tourism.wereda}
          </p>
        )}
      </div>
    </div>
  );
}
