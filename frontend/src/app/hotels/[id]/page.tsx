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
  const [phoneCountryCode, setPhoneCountryCode] = useState('+251');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
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

  // Validate booking form
  const validateBookingForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.checkIn) errors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) errors.checkOut = 'Check-out date is required';
    if (formData.checkIn && formData.checkOut && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      errors.checkOut = 'Check-out must be after check-in';
    }
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) errors.numberOfGuests = 'At least 1 guest required';
    if (formData.numberOfGuests > 20) errors.numberOfGuests = 'Maximum 20 guests';
    
    // Phone validation based on country code
    if (formData.clientPhone) {
      const phoneDigits = formData.clientPhone.replace(/\D/g, '');
      
      if (phoneCountryCode === '+251') {
        // Ethiopian phone: must start with 9 or 7, total 9 digits (e.g., 953816705)
        if (phoneDigits.length !== 9) {
          errors.clientPhone = 'Ethiopian phone must be 9 digits (e.g., 9XXXXXXXX)';
        } else if (!/^[97]/.test(phoneDigits)) {
          errors.clientPhone = 'Ethiopian phone must start with 9 or 7';
        }
      } else {
        // Other countries: general validation (6-15 digits)
        if (phoneDigits.length < 6 || phoneDigits.length > 15) {
          errors.clientPhone = 'Invalid phone number';
        }
      }
    }
    
    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      errors.clientEmail = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setAuthModal(true); return; }
    if (!token || !userId) { setBookingError("Please log out and log in again."); return; }
    
    if (!validateBookingForm()) return;

    try {
      setSubmitting(true);
      setBookingError(null);
      const bookingData = {
        ...formData,
        clientPhone: formData.clientPhone ? `${phoneCountryCode}${formData.clientPhone.replace(/^0+/, '')}` : ''
      };
      const newBooking = await BookingService.createBooking(token, userId, bookingData);
      setMyBookings([newBooking, ...myBookings]);
      setSelectedBooking(newBooking);
      setActiveTab('my-bookings');
      setFormData({ ...formData, checkIn: '', checkOut: '', specialRequests: '', clientPhone: '', clientEmail: '' });
      setFormErrors({});
      alert('Booking request submitted successfully!');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!token || !userId || !selectedBooking || !receiptFile) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.uploadReceiptFile(token, selectedBooking.bookingId, receiptFile, userId);
      setSelectedBooking(updated);
      setMyBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
      setReceiptFile(null);
      setReceiptPreview(null);
      alert('Receipt uploaded successfully!');
    } catch (err) { alert('Failed to upload receipt'); }
    finally { setSubmitting(false); }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select an image file (JPG, PNG, GIF, WebP) or PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setReceiptPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-[#111827] font-bold">Loading Hotel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="bg-white p-8 rounded-2xl text-center border border-[#E5E7EB] shadow-xl">
          <div className="text-5xl mb-4">🏨</div>
          <h2 className="text-2xl font-black text-[#111827] mb-3">Hotel Not Found</h2>
          <p className="text-[#6B7280] font-semibold mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-black hover:bg-[#1D4ED8] shadow-lg transition-all">
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
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 md:hidden bg-[#111827] p-2.5 rounded-xl shadow-xl text-white text-sm font-black hover:bg-[#1E293B] transition-all"
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
        <div className="relative h-48 md:h-56">
          <Image
            src={hotel.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1564507592333-cdd18562ea6f?w=800"}
            alt={hotel.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/50 to-transparent" />
          
          {/* Image Navigation */}
          {hotel.images && hotel.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {hotel.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {/* Hotel Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white font-medium">
                {'★'.repeat(starRating)}{'☆'.repeat(5 - starRating)}
              </span>
              <span className={`px-3 py-1 rounded-full font-bold ${hotel.active !== false ? "bg-[#16A34A] text-white" : "bg-[#DC2626] text-white"}`}>
                {hotel.active !== false ? "✓ Active" : "✗ Inactive"}
              </span>
              {(isHotelOwner || isAdmin) && (
                <span className="bg-[#F59E0B] px-3 py-1 rounded-full text-white font-bold">
                  {isHotelOwner ? "🔑 Your Hotel" : "👑 Admin"}
                </span>
              )}
              {contactInfo && (
                <a href={`tel:${contactInfo}`} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white font-medium hover:bg-white/30">
                  📞 {contactInfo}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 min-h-[calc(100vh-14rem)]">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Info Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="text-3xl mb-3">🏨</div>
                  <h3 className="text-[#2563EB] font-black text-base mb-2">About</h3>
                  <p className="text-[#1E3A5F] text-sm leading-relaxed font-semibold">{hotel.description || "A wonderful place to stay with excellent amenities and service."}</p>
                </div>
                
                {policies && (
                  <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-5 shadow-lg border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="text-3xl mb-3">📋</div>
                    <h3 className="text-[#D97706] font-black text-base mb-2">Policies</h3>
                    <p className="text-[#78350F] text-sm leading-relaxed font-semibold">{policies}</p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-5 shadow-lg border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="text-3xl mb-3">⭐</div>
                  <h3 className="text-[#CA8A04] font-black text-base mb-2">Rating</h3>
                  <div className="text-4xl font-black text-[#EAB308]">{starRating}/5</div>
                  <p className="text-[#A16207] text-xs font-bold">Star Rating</p>
                </div>
              </div>

              {/* Image Gallery */}
              {hotel.images && hotel.images.length > 1 && (
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 shadow-lg border-2 border-purple-200">
                  <h3 className="text-[#7C3AED] font-black text-base mb-4">📸 Gallery</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {hotel.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative h-20 md:h-24 rounded-lg overflow-hidden transition-all border-3 ${idx === currentImageIndex ? 'border-[#7C3AED] ring-4 ring-purple-300 scale-105' : 'border-purple-200 hover:border-[#7C3AED] hover:scale-105'}`}
                      >
                        <Image src={img} alt={`${hotel.name} ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] rounded-xl p-6 text-center shadow-xl">
                <h3 className="text-2xl font-black text-white mb-2">Ready to Book?</h3>
                <p className="text-blue-100 text-sm font-semibold mb-5">Experience luxury and comfort at {hotel.name}</p>
                <button
                  onClick={() => isAuthenticated ? setActiveTab('booking') : setAuthModal(true)}
                  className="bg-white text-[#2563EB] px-8 py-3 rounded-xl font-black hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
                >
                  📅 Book Now
                </button>
              </div>
            </div>
          )}

          {/* Booking Tab */}
          {activeTab === 'booking' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-xl border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">📅</div>
                  <div>
                    <h2 className="text-xl font-black text-[#065F46]">Request a Booking</h2>
                    <p className="text-emerald-600 text-sm font-semibold">Fill in your details for review</p>
                  </div>
                </div>

                {bookingError && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 text-red-700 p-4 rounded-xl mb-6 font-black flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleSubmitBooking} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-emerald-700 text-sm font-black mb-2">📅 Check-in Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.checkIn}
                        onChange={(e) => { setFormData({ ...formData, checkIn: e.target.value }); setFormErrors({ ...formErrors, checkIn: '' }); }}
                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-[#065F46] font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 hover:border-emerald-400 transition-all shadow-sm ${formErrors.checkIn ? 'border-red-500 bg-red-50' : 'border-emerald-200'}`}
                      />
                      {formErrors.checkIn && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.checkIn}</p>}
                    </div>
                    <div className="group">
                      <label className="block text-emerald-700 text-sm font-black mb-2">📅 Check-out Date *</label>
                      <input
                        type="date"
                        required
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        value={formData.checkOut}
                        onChange={(e) => { setFormData({ ...formData, checkOut: e.target.value }); setFormErrors({ ...formErrors, checkOut: '' }); }}
                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-[#065F46] font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 hover:border-emerald-400 transition-all shadow-sm ${formErrors.checkOut ? 'border-red-500 bg-red-50' : 'border-emerald-200'}`}
                      />
                      {formErrors.checkOut && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.checkOut}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-purple-700 text-sm font-black mb-2">👥 Guests *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={20}
                        value={formData.numberOfGuests}
                        onChange={(e) => { setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 }); setFormErrors({ ...formErrors, numberOfGuests: '' }); }}
                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-purple-800 font-bold focus:border-purple-500 focus:ring-4 focus:ring-purple-200 hover:border-purple-400 transition-all shadow-sm ${formErrors.numberOfGuests ? 'border-red-500 bg-red-50' : 'border-purple-200'}`}
                      />
                      {formErrors.numberOfGuests && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.numberOfGuests}</p>}
                    </div>
                    <div className="group">
                      <label className="block text-purple-700 text-sm font-black mb-2">🛏️ Rooms</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.numberOfRooms || 1}
                        onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-purple-800 font-bold focus:border-purple-500 focus:ring-4 focus:ring-purple-200 hover:border-purple-400 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-blue-700 text-sm font-black mb-2">📞 Phone (International)</label>
                      <div className="flex gap-2">
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          className="w-28 bg-white border-2 border-blue-200 rounded-xl px-2 py-3 text-blue-800 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-200 hover:border-blue-400 transition-all shadow-sm"
                        >
                          <option value="+251">🇪🇹 +251</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+254">🇰🇪 +254</option>
                          <option value="+255">🇹🇿 +255</option>
                          <option value="+256">🇺🇬 +256</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+55">🇧🇷 +55</option>
                        </select>
                        <input
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => { setFormData({ ...formData, clientPhone: e.target.value.replace(/[^\d]/g, '') }); setFormErrors({ ...formErrors, clientPhone: '' }); }}
                          placeholder={phoneCountryCode === '+251' ? "9XXXXXXXX or 7XXXXXXXX" : "Phone number"}
                          className={`flex-1 bg-white border-2 rounded-xl px-4 py-3 text-blue-800 font-bold placeholder-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 hover:border-blue-400 transition-all shadow-sm ${formErrors.clientPhone ? 'border-red-500 bg-red-50' : 'border-blue-200'}`}
                        />
                      </div>
                      {formErrors.clientPhone && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.clientPhone}</p>}
                      {phoneCountryCode === '+251' && <p className="text-blue-600 text-xs font-semibold mt-1">Ethiopian: 9 digits starting with 9 (Ethio Telecom) or 7 (Safaricom)</p>}
                    </div>
                    <div className="group">
                      <label className="block text-blue-700 text-sm font-black mb-2">✉️ Email</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => { setFormData({ ...formData, clientEmail: e.target.value }); setFormErrors({ ...formErrors, clientEmail: '' }); }}
                        placeholder="your@email.com"
                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-blue-800 font-bold placeholder-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 hover:border-blue-400 transition-all shadow-sm ${formErrors.clientEmail ? 'border-red-500 bg-red-50' : 'border-blue-200'}`}
                      />
                      {formErrors.clientEmail && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.clientEmail}</p>}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-amber-700 text-sm font-black mb-2">📝 Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any special requirements..."
                      rows={3}
                      className="w-full bg-white border-2 border-amber-200 rounded-xl px-4 py-3 text-amber-800 font-bold placeholder-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 hover:border-amber-400 transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-black text-lg hover:bg-gray-300 transition-all shadow-md border-2 border-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:from-emerald-600 hover:to-teal-600 hover:scale-[1.02] disabled:opacity-50 transition-all shadow-xl"
                    >
                      {submitting ? '⏳ Submitting...' : '✓ Submit Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'my-bookings' && (
            <div>
              {bookingsLoading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-purple-700 font-black">Loading bookings...</p>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-white to-purple-50 rounded-2xl border-2 border-purple-200 shadow-xl">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-black text-purple-800 mb-2">No Bookings Yet</h3>
                  <p className="text-purple-600 font-semibold mb-6">You haven't made any bookings for this hotel.</p>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-black hover:from-purple-600 hover:to-indigo-600 hover:scale-105 transition-all shadow-lg"
                  >
                    ✨ Create New Booking
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Bookings List */}
                  <div className="space-y-3">
                    <h3 className="text-purple-800 text-sm font-black uppercase mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">📋</span>
                      Your Bookings
                    </h3>
                    {myBookings.map((b) => (
                      <button
                        key={b.bookingId}
                        onClick={() => setSelectedBooking(b)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedBooking?.bookingId === b.bookingId
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-500 shadow-lg scale-[1.02]'
                            : 'bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-purple-800 font-black text-lg">#{b.bookingId}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${BookingService.getStatusColor(b.bookingStatus)}`}>
                            {BookingService.getStatusLabel(b.bookingStatus)}
                          </span>
                        </div>
                        <div className="text-indigo-700 text-sm font-bold">{b.checkIn} → {b.checkOut}</div>
                        <div className="text-purple-500 text-sm font-semibold">{b.numberOfGuests} guests</div>
                      </button>
                    ))}
                  </div>

                  {/* Booking Details */}
                  <div className="lg:col-span-2">
                    {selectedBooking ? (
                      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl border-2 border-indigo-200 overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-black text-white">Booking #{selectedBooking.bookingId}</h3>
                              <p className="text-indigo-100 text-sm font-bold">{selectedBooking.hotel.name}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-black ${BookingService.getStatusColor(selectedBooking.bookingStatus)}`}>
                              {BookingService.getStatusLabel(selectedBooking.bookingStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 space-y-5">
                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 hover:border-emerald-400 transition-all">
                              <p className="text-emerald-600 text-xs uppercase font-black">📅 Check-in</p>
                              <p className="text-emerald-800 font-black text-lg">{selectedBooking.checkIn}</p>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border-2 border-rose-200 hover:border-rose-400 transition-all">
                              <p className="text-rose-600 text-xs uppercase font-black">📅 Check-out</p>
                              <p className="text-rose-800 font-black text-lg">{selectedBooking.checkOut}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all">
                              <p className="text-blue-600 text-xs uppercase font-black">👥 Guests</p>
                              <p className="text-blue-800 font-black text-lg">{selectedBooking.numberOfGuests}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 hover:border-amber-400 transition-all">
                              <p className="text-amber-600 text-xs uppercase font-black">🛏️ Rooms</p>
                              <p className="text-amber-800 font-black text-lg">{selectedBooking.numberOfRooms || 1}</p>
                            </div>
                          </div>

                          {selectedBooking.totalCost && (
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-center shadow-lg">
                              <p className="text-emerald-100 text-sm font-black">💰 Total Cost</p>
                              <p className="text-4xl font-black text-white">{selectedBooking.totalCost} ETB</p>
                            </div>
                          )}

                          {/* Status Actions */}
                          {selectedBooking.bookingStatus === BOOKING_STATUS.COST_PROPOSED && (
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-300 rounded-xl p-5">
                              <h4 className="text-violet-700 font-black text-lg mb-4 flex items-center gap-2">
                                <span className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white">💰</span>
                                Payment Required
                              </h4>
                              <div className="space-y-4">
                                <div className="border-3 border-dashed border-violet-400 rounded-xl p-6 text-center hover:bg-violet-100 hover:border-violet-500 transition-all cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleReceiptFileChange}
                                    className="hidden"
                                    id="receipt-upload-input"
                                  />
                                  <label htmlFor="receipt-upload-input" className="cursor-pointer block">
                                    {receiptFile ? (
                                      <div>
                                        <div className="text-emerald-500 text-5xl mb-3">✓</div>
                                        <p className="text-violet-800 font-black text-lg">{receiptFile.name}</p>
                                        <p className="text-violet-500 text-sm font-semibold">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="text-violet-400 text-5xl mb-3">📁</div>
                                        <p className="text-violet-800 font-bold text-lg">Click to select receipt file</p>
                                        <p className="text-violet-500 text-sm font-semibold">JPG, PNG, GIF, WebP or PDF (max 10MB)</p>
                                      </div>
                                    )}
                                  </label>
                                </div>
                                {receiptPreview && (
                                  <div className="mt-3">
                                    <img src={receiptPreview} alt="Preview" className="max-h-40 rounded-xl mx-auto border-3 border-violet-300 shadow-lg" />
                                  </div>
                                )}
                                <button
                                  onClick={handleUploadReceipt}
                                  disabled={!receiptFile || submitting}
                                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-4 rounded-xl font-black text-lg hover:from-violet-600 hover:to-purple-600 hover:scale-[1.02] disabled:opacity-50 transition-all shadow-lg"
                                >
                                  {submitting ? '⏳ Uploading...' : '📤 Upload Receipt'}
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedBooking.bookingStatus === BOOKING_STATUS.APPROVED && (
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-6 text-center shadow-lg">
                              <div className="text-5xl mb-3">✓</div>
                              <h4 className="text-white font-black text-xl">Booking Confirmed!</h4>
                              <p className="text-emerald-100 text-sm font-semibold">Enjoy your stay!</p>
                            </div>
                          )}

                          {/* Messages */}
                          <div className="bg-green-900 rounded-xl p-5 mt-2">
                            <h4 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                              <span className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white text-sm">💬</span>
                              Messages ({selectedBooking.messages?.length || 0})
                            </h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-4 bg-green-300 p-4 rounded-xl shadow-inner [&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar-track]:bg-gray-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-300">
                              {selectedBooking.messages?.length > 0 ? (
                                selectedBooking.messages.map((m) => (
                                  <div key={m.id} className={`p-4 rounded-xl shadow-md ${m.senderId === userId ? 'bg-green-500 ml-8' : 'bg-green-100 mr-8'}`}>
                                    <div className="flex justify-between text-xs text-green-950 mb-2">
                                      <span className="font-black">{m.senderName}</span>
                                      <span className="font-bold">{new Date(m.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-900 font-bold">{m.message}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-green-950 text-center py-6 font-bold">No messages yet</p>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-green-600 transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="bg-green-700 text-white px-6 py-3 rounded-xl font-black hover:bg-green-800 disabled:opacity-50 transition-all shadow-md"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl border-2 border-indigo-200 p-16 text-center shadow-lg">
                        <div className="text-5xl mb-4">👆</div>
                        <p className="text-indigo-600 font-bold text-lg">Select a booking to view details</p>
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
    </div>
  );
}
