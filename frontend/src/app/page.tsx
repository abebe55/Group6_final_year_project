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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000" />
      </div>
      <TopBar showCategories={false} />
      <section className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-teal-900/50 to-slate-900/60" />
        <img src="/images/hero.jpg" alt="North Wollo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight drop-shadow-2xl">Explore North Wollo</h1>
        </div>
      </section>

      <section className="px-4 py-6 bg-gradient-to-r from-emerald-900/90 via-slate-900/95 to-emerald-900/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Link href="/tourisms" className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full hover:from-emerald-600 hover:to-teal-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">Explore Places</Link>
              <button onClick={handleSelectAll} className="text-sm font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                {selectedCategories.length === categories.length ? "Clear All" : "Select All"}
              </button>
              {selectedCategories.length > 0 && <span className="text-sm text-slate-400 font-medium">{selectedCategories.length} selected</span>}
            </div>
            <button onClick={handleViewSelected} disabled={selectedCategories.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2 font-bold rounded-full text-sm transition-all ${selectedCategories.length > 0 ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}>
              <span>🔍</span>
              <span>{selectedCategories.length === 0 ? "Select Categories" : `View ${selectedCategories.length}`}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`group relative overflow-hidden rounded-xl transition-all duration-300 text-left ${isSelected ? "ring-2 ring-emerald-500 ring-offset-1 shadow-lg scale-[1.02]" : "shadow-md hover:shadow-lg hover:scale-[1.01]"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} ${isSelected ? "opacity-100" : "opacity-80"} transition-opacity`} />
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-white border-white" : "bg-white/20 border-white/50"}`}>
                    {isSelected && <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="relative p-3 flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${isSelected ? "bg-white/30 scale-110" : "bg-white/20"}`}>{cat.icon}</div>
                    <div className="flex-1"><h3 className="text-sm font-bold text-white">{cat.name}</h3></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-8 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Discover North Wollo&#39;s Rich Heritage</h2>
              <p className="text-slate-400 mb-3 text-sm leading-relaxed">North Wollo Tourism is your gateway to exploring one of Ethiopia&#39;s most beautiful regions. Home to ancient churches, stunning highlands, mysterious caves, and vibrant cultural traditions.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Verified Destinations</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Local Expert Guides</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> Sustainable Tourism</div>
                <div className="flex items-center gap-2 text-slate-300"><span className="text-emerald-400">✓</span> 24/7 Support</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-5 text-white border border-emerald-500/30">
              <h3 className="text-lg font-bold mb-2">Our Vision</h3>
              <p className="text-xs opacity-90 mb-3">To make North Wollo a world-renowned tourism destination while empowering local communities.</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-xl font-bold">2025</div><div className="text-xs opacity-80">Established</div></div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-xl font-bold">100%</div><div className="text-xs opacity-80">Local Team</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-8 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4"><h2 className="text-xl md:text-2xl font-bold mb-1">Get in Touch</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-slate-800 transition-colors border border-slate-700/50"><span className="text-xl mb-1 block">📍</span><h3 className="font-semibold text-sm mb-0.5">Visit Us</h3><p className="text-xs text-slate-400">Woldia, North Wollo Zone</p></div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-slate-800 transition-colors border border-slate-700/50"><span className="text-xl mb-1 block">📞</span><h3 className="font-semibold text-sm mb-0.5">Call Us</h3><p className="text-xs text-slate-400">+251 911 234 567</p></div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-slate-800 transition-colors border border-slate-700/50"><span className="text-xl mb-1 block">📧</span><h3 className="font-semibold text-sm mb-0.5">Email Us</h3><p className="text-xs text-slate-400">info@northwollotourism.com</p></div>
          </div>
          <div className="flex justify-center gap-2">
            <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors text-base">📘</a>
            <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-sky-500 rounded-full flex items-center justify-center transition-colors text-base">🐦</a>
            <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors text-base">📷</a>
            <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors text-base">▶️</a>
            <a href="#" className="w-9 h-9 bg-slate-700 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors text-base">✈️</a>
          </div>
        </div>
      </section>

      <section className="px-4 py-5 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-white text-center md:text-left"><h3 className="text-lg font-bold">Stay Updated</h3></div>
          <form className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 md:w-56 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30" />
            <button type="submit" className="px-5 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
