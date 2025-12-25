"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";

export default function HomePage() {
  const router = useRouter();
  
  const categories = ["HERITAGE", "HIGHLAND", "CAVERN", "AQUATICS", "CULTURE", "MODERN"];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const handleExploreButton = useCallback(() => {
    if (selectedCategories.length === 0) return;
    
    // ✅ NAVIGATE TO SEPARATE LISTING PAGE with categories as query params
    const categoriesParam = selectedCategories.join(",");
    router.push(`/tourisms?categories=${categoriesParam}`);
  }, [selectedCategories, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50">
      <TopBar />

      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-indigo-900/20 to-slate-900/20" />
        <img
          src="/images/hero.jpg"
          alt="Explore North Wollo Tourism"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-2xl">
            Explore North Wollo
          </h1>
          <p className="text-2xl md:text-3xl mb-12 drop-shadow-lg leading-relaxed">
            Discover Heritage, Culture & Adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={handleExploreButton}
              disabled={selectedCategories.length === 0}
              className="px-12 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-3xl hover:from-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {selectedCategories.length === 0 ? "Select Categories" : `Explore ${selectedCategories.length}`}
            </button>
            <div className="text-lg opacity-90">
              {selectedCategories.length > 0 && `${selectedCategories.length} category${selectedCategories.length > 1 ? 's' : ''} selected`}
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-6">
              Choose Your Adventure
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Select categories below to discover amazing destinations in North Wollo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                isSelected={selectedCategories.includes(cat)}
                onToggle={toggleCategory}
              />
            ))}
          </div>

          {/* Selected Categories Preview */}
          {selectedCategories.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-lg text-gray-600 mb-8">
                Selected: <span className="font-semibold text-emerald-600">{selectedCategories.join(", ")}</span>
              </p>
              <button
                onClick={handleExploreButton}
                className="px-16 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-3xl hover:from-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                🚀 Explore {selectedCategories.length} Destinations
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Teaser */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 bg-gradient-to-b from-emerald-50 to-indigo-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">
            Ready for Your Journey?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-6">🏨</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Book Hotels</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Find perfect accommodations near your destinations</p>
            </div>
            <div className="p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-6">⭐</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Real Reviews</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Read authentic experiences from other travelers</p>
            </div>
            <div className="p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-5xl mb-6">🗺️</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Road Maps</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Navigate with detailed road information</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Category Chip Component
function CategoryChip({ 
  category, 
  isSelected, 
  onToggle 
}: { 
  category: string; 
  isSelected: boolean; 
  onToggle: (cat: string) => void;
}) {
  const icons: Record<string, string> = {
    HERITAGE: "🕌",
    HIGHLAND: "⛰️",
    CAVER: "🕳️",
    AQUATICS: "🌊",
    CULTURE: "🎭",
    MODERN: "🏛️"
  };

  return (
    <button
      onClick={() => onToggle(category)}
      className={`group p-8 rounded-3xl transition-all duration-400 transform hover:scale-105 hover:shadow-2xl shadow-lg h-full flex flex-col items-center justify-center text-center border-4 ${
        isSelected
          ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-emerald-500/50"
          : "bg-white/80 backdrop-blur-sm hover:bg-emerald-50 border-gray-200 hover:border-emerald-300 hover:shadow-emerald-200"
      }`}
    >
      <div className={`text-4xl mb-4 transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-110'}`}>
        {icons[category as keyof typeof icons] || "🌟"}
      </div>
      <span className={`font-bold text-xl transition-all ${isSelected ? 'drop-shadow-lg' : 'group-hover:text-emerald-700'}`}>
        {category}
      </span>
    </button>
  );
}
