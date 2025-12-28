"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import TourismCard from "@/components/tourism/TourismCard";
import LoginForm from "@/app/auth/login/page";
import RegisterForm from "@/app/auth/register/page";
import Modal from "@/components/common/Modal";
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

export default function TourismListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("categories") || "";
  const keywordParam = searchParams.get("keyword") || "";
  const initialCategories = categoryParam ? categoryParam.split(",") : [];

  // States
  const [tourismPlaces, setTourismPlaces] = useState<TourismPublicCard[]>([]);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [currentKeyword, setCurrentKeyword] = useState(keywordParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12;

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
        size: PAGE_SIZE 
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
  }, [categories, currentKeyword]);

  useEffect(() => {
    fetchPlaces(0);
  }, [categories.join(","), currentKeyword, fetchPlaces]);

  const handleCategoryToggle = useCallback((category: string) => {
    setCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      const params = new URLSearchParams(searchParams);
      if (newCategories.length > 0) {
        params.set("categories", newCategories.join(","));
      } else {
        params.delete("categories");
      }
      if (currentKeyword.trim()) {
        params.set("keyword", currentKeyword);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      
      return newCategories;
    });
  }, [searchParams, currentKeyword, router]);

  const handleSearch = useCallback((keyword: string) => {
    setCurrentKeyword(keyword);
    const params = new URLSearchParams(searchParams);
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    } else {
      params.delete("keyword");
    }
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, categories, router]);

  const handlePageChange = useCallback((page: number) => {
    fetchPlaces(page);
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
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null);
      setTimeout(() => navigateWithFeedback(id), 500);
    }
  };

  const switchToRegister = () => setAuthModalContent("register");
  const switchToLogin = () => setAuthModalContent("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-emerald-50">
      <TopBar 
        keyword={currentKeyword} 
        onSearch={handleSearch}
        categories={categories}
        onCategoryToggle={handleCategoryToggle}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Page title & summary */}
        <div className="text-center mb-16 lg:mb-24 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text leading-tight">
            Discover North Wollo
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {categories.length > 0 
              ? `Showing ${totalElements.toLocaleString()} ${categories.join(", ")} destinations`
              : currentKeyword
                ? `Found ${totalElements.toLocaleString()} places matching "${currentKeyword}"`
                : `Explore ${totalElements.toLocaleString()} amazing tourism places`
            }
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-4xl mb-8 px-4 py-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-medium text-sm">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tourism grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(PAGE_SIZE).fill(0).map((_, i) => (
              <div key={i} className="w-full h-80 md:h-96 bg-gray-200 animate-pulse rounded-3xl shadow-xl overflow-hidden" />
            ))}
          </div>
        ) : tourismPlaces.length === 0 ? (
          <div className="text-center py-24 px-4 max-w-md mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">No Destinations Found</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">Try adjusting your search or category filters above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {tourismPlaces.map((tourism) => (
              <TourismCardInteractive
                key={tourism.id}
                tourism={tourism}
                isNavigating={navigatingId === tourism.id}
                onImageClick={() => requireAuthThenNavigate(tourism.id)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button disabled={currentPage >= totalPages - 1} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Auth modal */}
      <Modal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); setPendingNavId(null); }}>
        {authModalContent === "login" && <LoginForm onSuccess={handleLoginSuccess} onRegisterClick={switchToRegister} />}
        {authModalContent === "register" && <RegisterForm onSuccess={handleRegisterSuccess} onLoginClick={switchToLogin} />}
      </Modal>

      {navError && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 max-w-sm">
          {navError}
        </div>
      )}
    </div>
  );
}

// TourismCardInteractive (unchanged)
function TourismCardInteractive({ 
  tourism, 
  isNavigating, 
  onImageClick, 
  isAuthenticated 
}: { 
  tourism: TourismPublicCard; 
  isNavigating: boolean;
  onImageClick: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 cursor-pointer h-full flex flex-col">
      <div 
        className="relative h-64 md:h-72 lg:h-80 overflow-hidden bg-gray-200"
        onClick={onImageClick}
      >
        <img
          src={tourism.imageUrl}
          alt={tourism.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {isNavigating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2 text-white">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-semibold">Opening details...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2 leading-tight">{tourism.name}</h3>
          <div className="flex items-center space-x-1 text-emerald-600 font-bold text-lg">
            <span>👁️</span>
            <span>{tourism.viewersCount.toLocaleString()}</span>
          </div>
        </div>
        {tourism.wereda && <span className="text-sm text-gray-500">{tourism.wereda}</span>}
        {tourism.category && <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">{tourism.category}</span>}
      </div>
    </div>
  );
}
