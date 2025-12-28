"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuthStore } from "@/store/useAuthStore";
import { getHotelDetails } from "@/services/hotel.service";
import { submitHotelRating } from "@/services/rating.service";
import { BookingService, Booking, BookingRequest, BOOKING_STATUS } from "@/services/booking.service";
import { HotelDetailInfoDto } from "@/types/hotel";
import HotelRatingModal from "@/components/hotel/HotelRatingModal";
import RatingsViewModal from "@/components/common/RatingsViewModal";
import Modal from "@/components/common/Modal";
import LoginForm from "@/app/auth/login/page";
import RegisterForm from "@/app/auth/register/page";
import { API_BASE_URL } from "@/services/api";
import { ModeSwitcherCompact } from "@/components/common/ModeSwitcher";

type TabType = 'details' | 'booking' | 'my-bookings';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, userId, username, role, browsingMode } = useAuthStore();
  const hotelId = Number(params.id);

  // Hotel state
  const [hotel, setHotel] = useState<HotelDetailInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check if current user is the hotel owner (must be after hotel state)
  const isHotelOwner = hotel?.ownerId === userId;
  const isAdmin = role === "ADMIN";
  
  // Check if user is in owner mode and owns this hotel
  const isInOwnerMode = role === "HOTEL_OWNER" && browsingMode === "OWNER" && isHotelOwner;

  // Booking state
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingRequest>({
    hotelId,
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
    numberOfRooms: 1,
    specialRequests: '',
    clientPhone: '',
    clientEmail: '',
  });
  const [receiptUrl, setReceiptUrl] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [problemReport, setProblemReport] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Modal state
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingsViewOpen, setRatingsViewOpen] = useState(false);

  useEffect(() => {
    loadHotel();
  }, [hotelId, token]);

  useEffect(() => {
    if (activeTab === 'my-bookings' && isAuthenticated) {
      loadMyBookings();
    }
  }, [activeTab, isAuthenticated]);

  // Redirect hotel owner in owner mode to booking management page
  useEffect(() => {
    if (hotel && isInOwnerMode) {
      router.push(`/hotels/${hotelId}/booking`);
    }
  }, [hotel, isInOwnerMode, hotelId, router]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const data = await getHotelDetails(hotelId, token);
      setHotel(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load hotel");
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    if (!token || !userId) return;
    try {
      setBookingsLoading(true);
      const bookings = await BookingService.getMyBookings(token, userId);
      const hotelBookings = bookings.filter(b => b.hotel.id === hotelId);
      setMyBookings(hotelBookings);
      if (hotelBookings.length > 0 && !selectedBooking) {
        setSelectedBooking(hotelBookings[0]);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setAuthModal(true); return; }
    if (!token || !userId) { setBookingError("Please log out and log in again."); return; }
    if (!formData.checkIn || !formData.checkOut) { setBookingError("Please select check-in and check-out dates"); return; }
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) { setBookingError("Check-out date must be after check-in date"); return; }

    try {
      setSubmitting(true);
      setBookingError(null);
      const newBooking = await BookingService.createBooking(token, userId, formData);
      setMyBookings([newBooking, ...myBookings]);
      setSelectedBooking(newBooking);
      setActiveTab('my-bookings');
      setFormData({ ...formData, checkIn: '', checkOut: '', specialRequests: '' });
      alert('Booking request submitted successfully!');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!token || !userId || !selectedBooking || !receiptUrl) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.uploadReceipt(token, selectedBooking.bookingId, receiptUrl, userId);
      setSelectedBooking(updated);
      setMyBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
      setReceiptUrl('');
      alert('Receipt uploaded successfully!');
    } catch (err) { alert('Failed to upload receipt'); }
    finally { setSubmitting(false); }
  };

  const handleSendMessage = async () => {
    if (!token || !userId || !selectedBooking || !newMessage.trim()) return;
    try {
      const updated = await BookingService.sendMessage(token, selectedBooking.bookingId, newMessage, userId);
      setSelectedBooking(updated);
      setMyBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
      setNewMessage('');
    } catch (err) { alert('Failed to send message'); }
  };

  const handleReportProblem = async () => {
    if (!token || !userId || !selectedBooking || !problemReport.trim()) return;
    try {
      const updated = await BookingService.reportProblem(token, selectedBooking.bookingId, problemReport, userId);
      setSelectedBooking(updated);
      setMyBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
      setProblemReport('');
      alert('Problem reported to admin');
    } catch (err) { alert('Failed to report problem'); }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!token) return;
    try {
      await submitHotelRating(hotelId, rating, comment || undefined, token);
      setRatingModalOpen(false);
      alert("Thank you for your review!");
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed to submit rating"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-500/20 rounded-full animate-pulse blur-xl"></div>
          </div>
          <p className="mt-6 text-2xl font-bold text-white">Loading Hotel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-rose-800">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl text-center border border-white/20">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-3xl font-bold text-white mb-4">Hotel Not Found</h2>
          <p className="text-white/80 mb-8">{error}</p>
          <button onClick={() => router.back()} className="px-8 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-white/90 transition">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const starRating = hotel.starRating || hotel.stars || 4;
  const contactInfo = hotel.contactInfo || '';
  const policies = hotel.policies || '';

  const navigation = [
    { id: 'details', label: 'Hotel Details', icon: '🏨', color: 'from-emerald-500 to-teal-500' },
    { id: 'booking', label: 'New Booking', icon: '📅', color: 'from-blue-500 to-indigo-500' },
    { id: 'my-bookings', label: 'My Bookings', icon: '📋', color: 'from-purple-500 to-pink-500', count: myBookings.length },
  ];

  // Add owner management link if user is the hotel owner or admin
  const ownerNavigation = (isHotelOwner || isAdmin) ? [
    { id: 'owner-manage', label: 'Manage Bookings', icon: '⚙️', color: 'from-orange-500 to-red-500', isOwnerLink: true },
  ] : [];

  const quickActions = [
    { label: 'Rate Hotel', icon: '⭐', action: () => isAuthenticated ? setRatingModalOpen(true) : setAuthModal(true), color: 'from-amber-400 to-orange-500' },
    { label: 'View Reviews', icon: '📝', action: () => setRatingsViewOpen(true), color: 'from-gray-500 to-gray-700' },
    { label: 'Call Hotel', icon: '📞', action: () => contactInfo && window.open(`tel:${contactInfo}`), color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 text-white"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900/95 via-emerald-900/95 to-teal-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Back */}
          <div className="p-6 border-b border-white/10">
            <button onClick={() => router.back()} className="flex items-center gap-3 text-white/80 hover:text-white transition group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Hotel Mini Card */}
          <div className="p-6 border-b border-white/10">
            <div className="relative h-32 rounded-2xl overflow-hidden mb-4">
              <Image
                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1564507592333-cdd18562ea6f?w=400"}
                alt={hotel.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-white font-bold text-lg truncate">{hotel.name}</h2>
                <div className="text-yellow-400 text-sm">
                  {'★'.repeat(starRating)}{'☆'.repeat(5 - starRating)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Navigation</p>
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if ((item.id === 'booking' || item.id === 'my-bookings') && !isAuthenticated) {
                    setAuthModal(true);
                  } else {
                    setActiveTab(item.id as TabType);
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-emerald-500/25`
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === item.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            {/* Owner Management Section */}
            {ownerNavigation.length > 0 && (
              <div className="pt-6">
                <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-wider px-3 mb-3">🔑 Owner Panel</p>
                {ownerNavigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/hotels/${hotelId}/booking`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Quick Actions</p>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            {/* Mode Switcher for HOTEL_OWNER */}
            {role === "HOTEL_OWNER" && (
              <div className="mb-3">
                <ModeSwitcherCompact className="w-full justify-center" />
              </div>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{username}</p>
                  <p className="text-white/50 text-sm">{role === "HOTEL_OWNER" ? (browsingMode === "OWNER" ? "Owner Mode" : "Client Mode") : "Logged in"}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition"
              >
                Login to Book
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen">
        {/* Hero Header */}
        <div className="relative h-64 md:h-80">
          <Image
            src={hotel.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1564507592333-cdd18562ea6f?w=800"}
            alt={hotel.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Image Navigation */}
          {hotel.images && hotel.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {hotel.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Hotel Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-white">{hotel.name}</h1>
              {/* Hotel Status Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                hotel.active !== false 
                  ? "bg-green-500/90 text-white" 
                  : "bg-red-500/90 text-white"
              }`}>
                {hotel.active !== false ? "✓ Active" : "✗ Inactive"}
              </span>
              {/* Owner Badge */}
              {(isHotelOwner || isAdmin) && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-500/90 text-white">
                  {isHotelOwner ? "🔑 Your Hotel" : "👑 Admin"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-yellow-400 text-xl">
                {'★'.repeat(starRating)}{'☆'.repeat(5 - starRating)}
              </div>
              {contactInfo && (
                <a href={`tel:${contactInfo}`} className="text-white/80 hover:text-white flex items-center gap-2">
                  <span>📞</span> {contactInfo}
                </a>
              )}
              {hotel.ownerName && (
                <span className="text-white/60 text-sm">
                  Managed by: {hotel.ownerName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Info Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="text-3xl mb-3">🏨</div>
                  <h3 className="text-white font-bold text-lg mb-2">About</h3>
                  <p className="text-white/70">{hotel.description || "A wonderful place to stay with excellent amenities and service."}</p>
                </div>
                
                {policies && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="text-3xl mb-3">📋</div>
                    <h3 className="text-white font-bold text-lg mb-2">Policies</h3>
                    <p className="text-white/70">{policies}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30">
                  <div className="text-3xl mb-3">⭐</div>
                  <h3 className="text-white font-bold text-lg mb-2">Rating</h3>
                  <div className="text-4xl font-black text-emerald-400">{starRating}/5</div>
                  <p className="text-white/60 text-sm mt-1">Star Rating</p>
                </div>
              </div>

              {/* Image Gallery */}
              {hotel.images && hotel.images.length > 1 && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-bold text-lg mb-4">📸 Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hotel.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative h-24 md:h-32 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex ? 'border-emerald-500 scale-105' : 'border-transparent hover:border-white/30'
                        }`}
                      >
                        <Image src={img} alt={`${hotel.name} ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Book?</h3>
                <p className="text-white/80 mb-6">Experience luxury and comfort at {hotel.name}</p>
                <button
                  onClick={() => isAuthenticated ? setActiveTab('booking') : setAuthModal(true)}
                  className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition shadow-lg"
                >
                  📅 Book Now
                </button>
              </div>
            </div>
          )}

          {/* Booking Tab */}
          {activeTab === 'booking' && (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">📅 Request a Booking</h2>
                <p className="text-white/60 mb-6">Fill in your details. The hotel owner will review and propose a cost.</p>

                {bookingError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">{bookingError}</div>
                )}

                <form onSubmit={handleSubmitBooking} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        required
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Guests *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={20}
                        value={formData.numberOfGuests}
                        onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Rooms</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.numberOfRooms || 1}
                        onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="+251 9XX XXX XXX"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any special requirements..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 transition-all"
                  >
                    {submitting ? '⏳ Submitting...' : '✓ Submit Booking Request'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <div className="animate-fadeIn">
              {bookingsLoading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-white/60">Loading bookings...</p>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                  <p className="text-white/60 mb-6">You haven't made any bookings for this hotel.</p>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition"
                  >
                    Create New Booking
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Bookings List */}
                  <div className="space-y-3">
                    <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">Your Bookings</h3>
                    {myBookings.map((b) => (
                      <button
                        key={b.bookingId}
                        onClick={() => setSelectedBooking(b)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedBooking?.bookingId === b.bookingId
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50'
                            : 'bg-white/5 border border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-bold">#{b.bookingId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(b.bookingStatus)}`}>
                            {BookingService.getStatusLabel(b.bookingStatus)}
                          </span>
                        </div>
                        <div className="text-white/60 text-sm">{b.checkIn} → {b.checkOut}</div>
                        <div className="text-white/40 text-sm">{b.numberOfGuests} guests</div>
                      </button>
                    ))}
                  </div>

                  {/* Booking Details */}
                  <div className="lg:col-span-2">
                    {selectedBooking ? (
                      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 border-b border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white">Booking #{selectedBooking.bookingId}</h3>
                              <p className="text-white/60">{selectedBooking.hotel.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${BookingService.getStatusColor(selectedBooking.bookingStatus)}`}>
                              {BookingService.getStatusLabel(selectedBooking.bookingStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4">
                              <p className="text-white/40 text-xs uppercase">Check-in</p>
                              <p className="text-white font-bold">{selectedBooking.checkIn}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                              <p className="text-white/40 text-xs uppercase">Check-out</p>
                              <p className="text-white font-bold">{selectedBooking.checkOut}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                              <p className="text-white/40 text-xs uppercase">Guests</p>
                              <p className="text-white font-bold">{selectedBooking.numberOfGuests}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                              <p className="text-white/40 text-xs uppercase">Rooms</p>
                              <p className="text-white font-bold">{selectedBooking.numberOfRooms || 1}</p>
                            </div>
                          </div>

                          {selectedBooking.totalCost && (
                            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 text-center">
                              <p className="text-white/60 text-sm">Total Cost</p>
                              <p className="text-3xl font-black text-emerald-400">{selectedBooking.totalCost} ETB</p>
                            </div>
                          )}

                          {/* Status Actions */}
                          {selectedBooking.bookingStatus === BOOKING_STATUS.COST_PROPOSED && (
                            <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                              <h4 className="text-purple-300 font-bold mb-3">💰 Payment Required</h4>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={receiptUrl}
                                  onChange={(e) => setReceiptUrl(e.target.value)}
                                  placeholder="Paste receipt image URL..."
                                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                                />
                                <button
                                  onClick={handleUploadReceipt}
                                  disabled={!receiptUrl || submitting}
                                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50"
                                >
                                  Upload
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedBooking.bookingStatus === BOOKING_STATUS.APPROVED && (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                              <div className="text-4xl mb-2">✓</div>
                              <h4 className="text-green-300 font-bold">Booking Confirmed!</h4>
                              <p className="text-green-200/70 text-sm">Enjoy your stay!</p>
                            </div>
                          )}

                          {/* Messages */}
                          <div className="border-t border-white/10 pt-6">
                            <h4 className="text-white font-bold mb-4">💬 Messages</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                              {selectedBooking.messages?.length > 0 ? (
                                selectedBooking.messages.map((m) => (
                                  <div key={m.id} className={`p-3 rounded-xl ${m.senderId === userId ? 'bg-emerald-500/20 ml-8' : 'bg-white/10 mr-8'}`}>
                                    <p className="text-white/40 text-xs mb-1">{m.senderName}</p>
                                    <p className="text-white">{m.message}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-white/40 text-center py-4">No messages yet</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                        <p className="text-white/40">Select a booking to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={authModal} onClose={() => setAuthModal(false)}>
        {authMode === 'login' ? (
          <LoginForm onSuccess={() => { setAuthModal(false); router.refresh(); }} onRegisterClick={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSuccess={() => { setAuthModal(false); }} onLoginClick={() => setAuthMode('login')} />
        )}
      </Modal>

      <HotelRatingModal
        isOpen={ratingModalOpen}
        hotelId={hotelId}
        hotelName={hotel?.name || "Hotel"}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
      />

      <RatingsViewModal
        isOpen={ratingsViewOpen}
        onClose={() => setRatingsViewOpen(false)}
        fetchUrl={`${API_BASE_URL}/ratings/hotel/${hotelId}`}
        token={token ?? undefined}
        title={hotel?.name ?? "Hotel Ratings"}
        refreshKey={0}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
