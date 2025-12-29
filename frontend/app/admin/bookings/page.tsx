"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { BookingService, Booking, BOOKING_STATUS } from "@/services/booking.service";
import { FormButton, Alert } from "@/components/common/FormInput";

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, token, userId, role } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [problemBookings, setProblemBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'problems'>('all');
  const [filter, setFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadBookings();
    loadProblemBookings();
  }, [isAuthenticated, role, page]);

  const loadBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await BookingService.getAllBookings(token, page, 50);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadProblemBookings = async () => {
    if (!token) return;
    try {
      const data = await BookingService.getProblemBookings(token);
      setProblemBookings(data);
    } catch (err) {
      console.error("Failed to load problem bookings:", err);
    }
  };

  const handleResolve = async () => {
    if (!token || !selectedBooking) return;
    try {
      setActionLoading(true);
      await BookingService.adminResolve(token, selectedBooking.bookingId, resolution);
      setSuccess("Problem resolved successfully!");
      setResolution("");
      await loadBookings();
      await loadProblemBookings();
      // Update selected booking
      const updated = bookings.find(b => b.bookingId === selectedBooking.bookingId);
      if (updated) setSelectedBooking({ ...updated, problemReported: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setActionLoading(false);
    }
  };

  const displayedBookings = activeTab === 'problems' ? problemBookings : bookings;
  const filteredBookings = displayedBookings.filter(b => {
    if (filter === "ALL") return true;
    return b.bookingStatus === filter;
  });

  const getStatusStats = () => {
    const stats: Record<string, number> = { ALL: bookings.length };
    bookings.forEach(b => {
      stats[b.bookingStatus] = (stats[b.bookingStatus] || 0) + 1;
    });
    return stats;
  };

  const stats = getStatusStats();

  if (!isAuthenticated || role !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Booking Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all hotel bookings</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/admin')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              ← Back to Admin
            </button>
            <button onClick={() => { loadBookings(); loadProblemBookings(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess(null)} /></div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{stats.ALL || 0}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{stats.REQUESTED || 0}</div>
            <div className="text-sm text-gray-500">Requested</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{stats.OWNER_ACCEPTED || 0}</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">{stats.COST_PROPOSED || 0}</div>
            <div className="text-sm text-gray-500">Cost Sent</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
            <div className="text-2xl font-bold text-indigo-600">{stats.PAID || 0}</div>
            <div className="text-sm text-gray-500">Paid</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.APPROVED || 0}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{problemBookings.length}</div>
            <div className="text-sm text-gray-500">Problems</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📋 All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'problems' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ⚠️ Problem Reports ({problemBookings.length})
          </button>
        </div>

        {/* Filter */}
        {activeTab === 'all' && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {['ALL', 'REQUESTED', 'OWNER_ACCEPTED', 'COST_PROPOSED', 'PAID', 'APPROVED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
              <h2 className="font-semibold text-gray-700 sticky top-0 bg-gray-50 py-2">
                {activeTab === 'problems' ? 'Problem Reports' : 'Bookings'} ({filteredBookings.length})
              </h2>
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  {activeTab === 'problems' ? 'No problem reports 🎉' : 'No bookings found'}
                </div>
              ) : (
                filteredBookings.map(b => (
                  <div
                    key={b.bookingId}
                    onClick={() => setSelectedBooking(b)}
                    className={`bg-white rounded-lg p-4 cursor-pointer border-2 transition hover:shadow-md ${
                      selectedBooking?.bookingId === b.bookingId ? 'border-blue-500 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">#{b.bookingId}</span>
                        {b.problemReported && <span className="ml-2 text-red-500">⚠️</span>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-800">🏨 {b.hotel.name}</div>
                      <div>👤 {b.client.fullName}</div>
                      <div>📅 {b.checkIn} → {b.checkOut}</div>
                      {b.totalCost && <div className="text-green-600 font-medium">💰 ${b.totalCost}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Booking Details */}
            <div className="lg:col-span-2">
              {selectedBooking ? (
                <div className="bg-white rounded-lg shadow-md">
                  {/* Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Booking #{selectedBooking.bookingId}</h2>
                        <p className="text-gray-600">{selectedBooking.hotel.name}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${BookingService.getStatusColor(selectedBooking.bookingStatus)}`}>
                        {BookingService.getStatusLabel(selectedBooking.bookingStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Hotel & Client Info */}
                  <div className="grid md:grid-cols-2 gap-6 p-6 border-b">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">🏨 Hotel Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500">Name:</span> <strong>{selectedBooking.hotel.name}</strong></div>
                        <div><span className="text-gray-500">Contact:</span> <strong>{selectedBooking.hotel.contactInfo || 'N/A'}</strong></div>
                        <div><span className="text-gray-500">Owner:</span> <strong>{selectedBooking.hotel.ownerName || 'N/A'}</strong></div>
                        <div><span className="text-gray-500">Status:</span> 
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${selectedBooking.hotel.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selectedBooking.hotel.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">👤 Client Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500">Name:</span> <strong>{selectedBooking.client.fullName}</strong></div>
                        <div><span className="text-gray-500">Username:</span> <strong>@{selectedBooking.client.username}</strong></div>
                        <div><span className="text-gray-500">Email:</span> <strong>{selectedBooking.client.email || 'N/A'}</strong></div>
                        <div><span className="text-gray-500">Phone:</span> <strong>{selectedBooking.client.phone || 'N/A'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-700 mb-3">📋 Booking Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-gray-500 text-xs">Check-in</div>
                        <div className="font-bold text-blue-700">{selectedBooking.checkIn}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <div className="text-gray-500 text-xs">Check-out</div>
                        <div className="font-bold text-red-700">{selectedBooking.checkOut}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-gray-500 text-xs">Guests</div>
                        <div className="font-bold text-purple-700">{selectedBooking.numberOfGuests}</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg text-center">
                        <div className="text-gray-500 text-xs">Rooms</div>
                        <div className="font-bold text-indigo-700">{selectedBooking.numberOfRooms || 1}</div>
                      </div>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <div className="text-gray-500 text-sm">Special Requests:</div>
                        <div className="text-gray-800">{selectedBooking.specialRequests}</div>
                      </div>
                    )}
                    {selectedBooking.totalCost && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-gray-500 text-sm">Total Cost</div>
                        <div className="text-3xl font-bold text-green-700">${selectedBooking.totalCost}</div>
                      </div>
                    )}
                  </div>

                  {/* Receipt */}
                  {selectedBooking.receiptImageUrl && (
                    <div className="p-6 border-b">
                      <h3 className="font-semibold text-gray-700 mb-3">🧾 Payment Receipt</h3>
                      <img src={selectedBooking.receiptImageUrl} alt="Receipt" className="max-w-md rounded-lg border shadow" />
                    </div>
                  )}

                  {/* Problem Report */}
                  {selectedBooking.problemReported && selectedBooking.problemReport && (
                    <div className="p-6 border-b bg-red-50">
                      <h3 className="font-semibold text-red-700 mb-3">⚠️ Problem Report</h3>
                      <p className="text-red-800 mb-4">{selectedBooking.problemReport}</p>
                      <div className="space-y-3">
                        <textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Enter resolution notes..."
                          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <FormButton
                          variant="primary"
                          onClick={handleResolve}
                          loading={actionLoading}
                          disabled={!resolution.trim()}
                        >
                          ✓ Mark as Resolved
                        </FormButton>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedBooking.bookingStatus === 'REJECTED' && selectedBooking.rejectionReason && (
                    <div className="p-6 border-b bg-red-50">
                      <h3 className="font-semibold text-red-700 mb-2">❌ Rejection Reason</h3>
                      <p className="text-red-800">{selectedBooking.rejectionReason}</p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">💬 Conversation History ({selectedBooking.messages?.length || 0})</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                      {selectedBooking.messages?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No messages</p>
                      ) : (
                        selectedBooking.messages?.map(m => (
                          <div key={m.id} className="bg-white p-3 rounded-lg border">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span className="font-medium">{m.senderName}</span>
                              <span>{new Date(m.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-800">{m.message}</div>
                            <span className="text-xs text-gray-400">[{m.messageType}]</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="p-4 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
                    <span>Created: {new Date(selectedBooking.createdAt).toLocaleString()}</span>
                    <span>Updated: {new Date(selectedBooking.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p>Select a booking to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {activeTab === 'all' && bookings.length >= 50 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border rounded-lg"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
