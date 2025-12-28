"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const categories = [
    { id: "HERITAGE", name: "Heritage", desc: "Ancient churches & monuments", icon: "🕌", gradient: "from-amber-500 to-orange-600" },
    { id: "HIGHLAND", name: "Highland", desc: "Mountain peaks & valleys", icon: "⛰️", gradient: "from-emerald-500 to-teal-600" },
    { id: "CAVERN", name: "Cavern", desc: "Mysterious caves", icon: "🕳️", gradient: "from-purple-500 to-indigo-600" },
    { id: "AQUATICS", name: "Aquatics", desc: "Lakes & waterfalls", icon: "🌊", gradient: "from-cyan-500 to-blue-600" },
    { id: "CULTURE", name: "Culture", desc: "Local traditions", icon: "🎭", gradient: "from-rose-500 to-pink-600" },
    { id: "MODERN", name: "Modern", desc: "Contemporary attractions", icon: "🏛️", gradient: "from-slate-600 to-gray-700" },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleViewSelected = () => {
    if (selectedCategories.length === 0) return;
    // Navigate with categories and sort by viewers descending
    router.push(`/tourisms?categories=${selectedCategories.join(",")}&sortBy=viewersCount&sortDir=desc`);
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Light background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000" />
      </div>

      <TopBar showCategories={false} />

      {/* Hero Section - Compact */}
      <section className="relative w-full h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-teal-900/50 to-slate-900/60" />
        <img src="/images/hero.jpg" alt="North Wollo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight drop-shadow-2xl">
            Explore North Wollo
          </h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-lg opacity-90">
            Discover Ethiopia&#39;s hidden treasures — Heritage, Culture, Adventure & Nature
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tourisms" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full hover:from-emerald-600 hover:to-teal-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
              Explore Places
            </Link>
            <Link href="/hotels" className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all border border-white/40">
              Find Hotels
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section - Multi-Select */}
      <section className="px-4 py-16 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold mb-3 border border-emerald-500/30">
              EXPLORE BY CATEGORY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Adventure</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Select one or more categories, then click View to explore destinations sorted by popularity</p>
          </div>
          
          {/* Select All / Clear */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleSelectAll}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              {selectedCategories.length === categories.length ? "Clear All" : "Select All"}
            </button>
            {selectedCategories.length > 0 && (
              <span className="text-sm text-slate-500">
                {selectedCategories.length} of {categories.length} selected
              </span>
            )}
          </div>
          
          {/* Category Cards - Selectable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 text-left ${
                    isSelected 
                      ? "ring-4 ring-emerald-500 ring-offset-2 shadow-xl scale-[1.02]" 
                      : "shadow-md hover:shadow-lg hover:scale-[1.01]"
                  }`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} ${isSelected ? "opacity-100" : "opacity-80"} transition-opacity`} />
                  
                  {/* Checkbox Indicator */}
                  <div className={`absolute top-4 right-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? "bg-white border-white" 
                      : "bg-white/20 border-white/50"
                  }`}>
                    {isSelected && (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                      isSelected ? "bg-white/30 scale-110" : "bg-white/20"
                    }`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-0.5">{cat.name}</h3>
                      <p className="text-white/80 text-sm">{cat.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <button
              onClick={handleViewSelected}
              disabled={selectedCategories.length === 0}
              className={`inline-flex items-center gap-3 px-10 py-4 font-bold rounded-full shadow-lg transition-all ${
                selectedCategories.length > 0
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>🔍</span>
              <span>
                {selectedCategories.length === 0 
                  ? "Select Categories Above" 
                  : `View ${selectedCategories.length} ${selectedCategories.length === 1 ? "Category" : "Categories"}`
                }
              </span>
              {selectedCategories.length > 0 && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </button>
            
            <Link 
              href="/tourisms?sortBy=viewersCount&sortDir=desc" 
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-400 font-medium hover:text-emerald-400 transition-colors"
            >
              <span>Or browse all destinations</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Selected Categories Preview */}
          {selectedCategories.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Selected: {" "}
                <span className="font-medium text-emerald-400">
                  {selectedCategories.map(id => categories.find(c => c.id === id)?.name).join(", ")}
                </span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Row - Compact */}
      <section className="px-4 py-12 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/hotels" className="flex items-center gap-4 p-5 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-500/30 transition-colors">🏨</div>
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Book Hotels</h3>
                <p className="text-sm text-slate-400">Find perfect accommodations</p>
              </div>
            </Link>
            <Link href="/tourisms" className="flex items-center gap-4 p-5 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-500/30 transition-colors">⭐</div>
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Real Reviews</h3>
                <p className="text-sm text-slate-400">Authentic traveler experiences</p>
              </div>
            </Link>
            <Link href="/map" className="flex items-center gap-4 p-5 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-500/30 transition-colors">🗺️</div>
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Interactive Map</h3>
                <p className="text-sm text-slate-400">Navigate with ease</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Compact */}
      <section id="about" className="px-4 py-12 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium mb-3 border border-emerald-500/30">ABOUT US</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Discover North Wollo&#39;s Rich Heritage</h2>
              <p className="text-slate-400 mb-4 leading-relaxed">
                North Wollo Tourism is your gateway to exploring one of Ethiopia&#39;s most beautiful regions. 
                Home to ancient churches, stunning highlands, mysterious caves, and vibrant cultural traditions.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Verified Destinations</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Local Expert Guides</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Sustainable Tourism</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> 24/7 Support</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white border border-emerald-500/30">
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-sm opacity-90 mb-4">
                To make North Wollo a world-renowned tourism destination while empowering local communities.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">2020</div>
                  <div className="text-xs opacity-80">Established</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs opacity-80">Local Team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Compact */}
      <section id="contact" className="px-4 py-12 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Get in Touch</h2>
            <p className="text-slate-500">Have questions? We&#39;d love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
              <span className="text-2xl mb-2 block">📍</span>
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-sm text-slate-400">Woldia, North Wollo Zone</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
              <span className="text-2xl mb-2 block">📞</span>
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-slate-400">+251 911 234 567</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
              <span className="text-2xl mb-2 block">📧</span>
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-sm text-slate-400">info@northwollotourism.com</p>
            </div>
          </div>
          {/* Social */}
          <div className="flex justify-center gap-3">
            <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors text-lg">📘</a>
            <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-sky-500 rounded-full flex items-center justify-center transition-colors text-lg">🐦</a>
            <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors text-lg">📷</a>
            <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors text-lg">▶️</a>
            <a href="#" className="w-10 h-10 bg-slate-700 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors text-lg">✈️</a>
          </div>
        </div>
      </section>

      {/* Newsletter - Compact */}
      <section className="px-4 py-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white text-center md:text-left">
            <h3 className="text-xl font-bold">Stay Updated</h3>
            <p className="text-emerald-100 text-sm">Get travel tips and exclusive offers</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30" />
            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />

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
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
