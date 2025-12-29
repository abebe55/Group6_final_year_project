"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import TopBar from "@/components/layout/TopBar";
import { BookingService, Booking, BOOKING_STATUS } from "@/services/booking.service";
import { ModeSwitcherCompact } from "@/components/common/ModeSwitcher";
import { API_BASE_URL } from "@/services/api";

interface OwnerHotel {
  id: number;
  name: string;
  description?: string;
  stars?: number;
  starRating?: number;
  contactInfo: string;
  active: boolean;
  images: string[];
  tourismPlaceName?: string;
  tourismPlaceId?: number;
  ownerId?: number;
  ownerName?: string;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, token, userId, role, browsingMode, setBrowsingMode } = useAuthStore();

  const [myHotels, setMyHotels] = useState<OwnerHotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'bookings'>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (role !== "HOTEL_OWNER" && role !== "ADMIN") {
      router.push("/");
      return;
    }
    // Auto-switch to owner mode
    if (role === "HOTEL_OWNER" && browsingMode !== "OWNER") {
      setBrowsingMode("OWNER");
    }
    loadData();
  }, [isAuthenticated, role]);

  const loadData = async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      setError(null);
      
      // Load owner's hotels
      try {
        const response = await fetch(`${API_BASE_URL}/hotels/owner/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const hotelsData = await response.json();
          setMyHotels(hotelsData);
        }
      } catch (e) {
        console.error("Failed to load hotels:", e);
      }
      
      // Load owner's bookings
      const bookingsData = await BookingService.getOwnerBookings(token, userId);
      setBookings(bookingsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Stats calculations
  const pendingCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.REQUESTED).length;
  const acceptedCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.OWNER_ACCEPTED).length;
  const costProposedCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.COST_PROPOSED).length;
  const paidCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.PAID).length;
  const approvedCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.APPROVED).length;
  const problemCount = bookings.filter(b => b.problemReported).length;
  const activeHotels = myHotels.filter(h => h.active).length;

  if (!isAuthenticated || (role !== "HOTEL_OWNER" && role !== "ADMIN")) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏨 Hotel Owner Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your hotels and bookings</p>
          </div>
          <div className="flex items-center gap-3">
            {role === "HOTEL_OWNER" && <ModeSwitcherCompact />}
            <button onClick={loadData} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
            <div className="text-3xl font-bold text-emerald-600">{myHotels.length}</div>
            <div className="text-gray-600 text-sm">My Hotels</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{activeHotels}</div>
            <div className="text-gray-600 text-sm">Active Hotels</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
            <div className="text-3xl font-bold text-indigo-600">{paidCount}</div>
            <div className="text-gray-600 text-sm">Awaiting Approval</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-gray-600 text-sm">Approved</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
            <div className="text-3xl font-bold text-gray-600">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{problemCount}</div>
            <div className="text-gray-600 text-sm">Problems</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: '📊 Overview', count: null },
            { id: 'hotels', label: '🏨 My Hotels', count: myHotels.length },
            { id: 'bookings', label: '📋 All Bookings', count: bookings.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Urgent Actions */}
                {(pendingCount > 0 || paidCount > 0 || problemCount > 0) && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
                    <h2 className="text-xl font-bold mb-4">⚡ Actions Required</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {pendingCount > 0 && (
                        <div className="bg-white/20 rounded-lg p-4">
                          <div className="text-3xl font-bold">{pendingCount}</div>
                          <div className="text-sm opacity-90">New booking requests waiting for your review</div>
                          <button 
                            onClick={() => router.push('/owner/bookings')}
                            className="mt-3 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90"
                          >
                            Review Now →
                          </button>
                        </div>
                      )}
                      {paidCount > 0 && (
                        <div className="bg-white/20 rounded-lg p-4">
                          <div className="text-3xl font-bold">{paidCount}</div>
                          <div className="text-sm opacity-90">Payments received - verify receipts</div>
                          <button 
                            onClick={() => router.push('/owner/bookings')}
                            className="mt-3 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90"
                          >
                            Verify Payments →
                          </button>
                        </div>
                      )}
                      {problemCount > 0 && (
                        <div className="bg-white/20 rounded-lg p-4">
                          <div className="text-3xl font-bold">{problemCount}</div>
                          <div className="text-sm opacity-90">Problem reports need attention</div>
                          <button 
                            onClick={() => router.push('/owner/bookings')}
                            className="mt-3 bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90"
                          >
                            View Problems →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* My Hotels Quick View */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">🏨 My Hotels</h2>
                    <button 
                      onClick={() => setActiveTab('hotels')}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  {myHotels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🏨</div>
                      <p>No hotels assigned to you yet.</p>
                      <p className="text-sm">Contact admin to get a hotel assigned.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myHotels.slice(0, 3).map(hotel => (
                        <div 
                          key={hotel.id}
                          className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => router.push(`/hotels/${hotel.id}/booking`)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                              🏨
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                              <div className="text-yellow-500 text-sm">
                                {'★'.repeat(hotel.stars || hotel.starRating || 4)}{'☆'.repeat(5 - (hotel.stars || hotel.starRating || 4))}
                              </div>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                                hotel.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {hotel.active ? '✓ Active' : '✗ Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-600">
                            {bookings.filter(b => b.hotel.id === hotel.id).length} bookings
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">📋 Recent Bookings</h2>
                    <button 
                      onClick={() => router.push('/owner/bookings')}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Manage All →
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📋</div>
                      <p>No bookings yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map(booking => (
                        <div 
                          key={booking.bookingId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push('/owner/bookings')}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                              {booking.client.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {booking.client.fullName} - {booking.hotel.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.checkIn} → {booking.checkOut} • {booking.numberOfGuests} guests
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {booking.totalCost && (
                              <span className="text-green-600 font-medium">{booking.totalCost} ETB</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(booking.bookingStatus)}`}>
                              {BookingService.getStatusLabel(booking.bookingStatus)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/owner/bookings')}
                    className="bg-emerald-600 text-white p-6 rounded-xl hover:bg-emerald-700 transition text-left"
                  >
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-bold text-lg">Manage Bookings</div>
                    <div className="text-emerald-100 text-sm">Accept, propose costs, approve payments</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition text-left"
                  >
                    <div className="text-3xl mb-2">🏨</div>
                    <div className="font-bold text-lg">View My Hotels</div>
                    <div className="text-blue-100 text-sm">See hotel details and manage bookings</div>
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition text-left"
                  >
                    <div className="text-3xl mb-2">🌍</div>
                    <div className="font-bold text-lg">Browse as Client</div>
                    <div className="text-purple-100 text-sm">Switch to client mode to explore</div>
                  </button>
                </div>
              </div>
            )}

            {/* Hotels Tab */}
            {activeTab === 'hotels' && (
              <div className="space-y-4">
                {myHotels.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Hotels Assigned</h3>
                    <p className="text-gray-600">Contact the administrator to get a hotel assigned to your account.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myHotels.map(hotel => {
                      const hotelBookings = bookings.filter(b => b.hotel.id === hotel.id);
                      const hotelPending = hotelBookings.filter(b => b.bookingStatus === BOOKING_STATUS.REQUESTED).length;
                      const hotelPaid = hotelBookings.filter(b => b.bookingStatus === BOOKING_STATUS.PAID).length;
                      
                      return (
                        <div key={hotel.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <div className="relative h-40 bg-gradient-to-br from-emerald-500 to-teal-600">
                            {hotel.images?.[0] ? (
                              <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/50">
                                🏨
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                hotel.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {hotel.active ? '✓ Active' : '✗ Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                            <div className="text-yellow-500 text-sm mb-2">
                              {'★'.repeat(hotel.starRating || 4)}{'☆'.repeat(5 - (hotel.starRating || 4))}
                            </div>
                            {hotel.contactInfo && (
                              <p className="text-gray-600 text-sm mb-3">📞 {hotel.contactInfo}</p>
                            )}
                            
                            {/* Hotel Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="font-bold text-gray-900">{hotelBookings.length}</div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                              <div className="bg-yellow-50 p-2 rounded text-center">
                                <div className="font-bold text-yellow-600">{hotelPending}</div>
                                <div className="text-xs text-gray-500">Pending</div>
                              </div>
                              <div className="bg-indigo-50 p-2 rounded text-center">
                                <div className="font-bold text-indigo-600">{hotelPaid}</div>
                                <div className="text-xs text-gray-500">To Approve</div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => router.push(`/hotels/${hotel.id}/booking`)}
                              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
                            >
                              Manage Bookings →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
                  <button
                    onClick={() => router.push('/owner/bookings')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Open Full Manager →
                  </button>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📋</div>
                    <p>No bookings yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map(b => (
                          <tr 
                            key={b.bookingId} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push('/owner/bookings')}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{b.bookingId}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{b.hotel.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{b.client.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{b.checkIn} → {b.checkOut}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{b.numberOfGuests}</td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">
                              {b.totalCost ? `${b.totalCost} ETB` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(b.bookingStatus)}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
