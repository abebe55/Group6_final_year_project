"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import TopBar from "@/components/layout/TopBar";
import { BookingService, Booking, BOOKING_STATUS } from "@/services/booking.service";
import { ModeSwitcherCompact } from "@/components/common/ModeSwitcher";

export default function OwnerBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, token, userId, role, browsingMode, setBrowsingMode } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  // Form states
  const [proposedCost, setProposedCost] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (role !== "HOTEL_OWNER" && role !== "ADMIN") {
      router.push("/");
      return;
    }
    // Auto-switch to owner mode when accessing this page
    if (role === "HOTEL_OWNER" && browsingMode !== "OWNER") {
      setBrowsingMode("OWNER");
    }
    loadBookings();
  }, [isAuthenticated, role]);

  const loadBookings = async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await BookingService.getOwnerBookings(token, userId);
      setBookings(data);
      if (data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: number) => {
    if (!token || !userId) return;
    try {
      setActionLoading(true);
      const updated = await BookingService.acceptBookingRequest(token, bookingId, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposeCost = async () => {
    if (!token || !userId || !selectedBooking || !proposedCost) return;
    try {
      setActionLoading(true);
      const cost = parseFloat(proposedCost);
      if (isNaN(cost) || cost <= 0) {
        alert("Please enter a valid cost");
        return;
      }
      const updated = await BookingService.proposeCost(token, selectedBooking.bookingId, cost, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setProposedCost("");
      setShowCostModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to propose cost");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (bookingId: number) => {
    if (!token || !userId) return;
    if (!confirm("Approve this booking? The client has uploaded their payment receipt.")) return;
    try {
      setActionLoading(true);
      const updated = await BookingService.approveBooking(token, bookingId, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token || !userId || !selectedBooking || !rejectReason) return;
    try {
      setActionLoading(true);
      const updated = await BookingService.rejectBooking(token, selectedBooking.bookingId, rejectReason, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setRejectReason("");
      setShowRejectModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !userId || !selectedBooking || !newMessage.trim()) return;
    try {
      const updated = await BookingService.ownerSendMessage(token, selectedBooking.bookingId, newMessage, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setNewMessage("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const updateBookingInList = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.bookingId === updated.bookingId ? updated : b)));
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return b.bookingStatus === BOOKING_STATUS.REQUESTED;
    if (filter === "ACTIVE") return [BOOKING_STATUS.OWNER_ACCEPTED, BOOKING_STATUS.COST_PROPOSED, BOOKING_STATUS.PAID].includes(b.bookingStatus);
    if (filter === "COMPLETED") return [BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED].includes(b.bookingStatus);
    return b.bookingStatus === filter;
  });

  if (!isAuthenticated || (role !== "HOTEL_OWNER" && role !== "ADMIN")) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">🏨 My Hotel Bookings</h1>
            <p className="text-gray-600 mt-1">Manage booking requests for your hotels</p>
          </div>
          <div className="flex items-center gap-3">
            {role === "HOTEL_OWNER" && <ModeSwitcherCompact />}
            <button onClick={loadBookings} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "PENDING", "ACTIVE", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f} ({f === "ALL" ? bookings.length : filteredBookings.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-semibold text-gray-700 mb-2">Bookings ({filteredBookings.length})</h2>
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">No bookings found</div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.bookingId}
                    onClick={() => setSelectedBooking(b)}
                    className={`bg-white rounded-lg p-4 cursor-pointer border-2 transition hover:shadow-md ${
                      selectedBooking?.bookingId === b.bookingId ? "border-emerald-500 shadow-md" : "border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">#{b.bookingId}</span>
                        <span className="text-gray-500 ml-2">{b.hotel.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>👤 {b.client.fullName}</div>
                      <div>📅 {b.checkIn} → {b.checkOut}</div>
                      <div>👥 {b.numberOfGuests} guests {b.numberOfRooms && `• ${b.numberOfRooms} rooms`}</div>
                    </div>
                    {b.problemReported && <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Problem Reported</div>}
                  </div>
                ))
              )}
            </div>

            {/* Booking Details */}
            <div className="lg:col-span-2">
              {selectedBooking ? (
                <div className="bg-white rounded-lg shadow-md">
                  {/* Header */}
                  <div className="p-6 border-b">
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

                  {/* Client Info */}
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-3">👤 Client Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Name:</span> <strong>{selectedBooking.client.fullName}</strong></div>
                      <div><span className="text-gray-500">Username:</span> <strong>{selectedBooking.client.username}</strong></div>
                      <div><span className="text-gray-500">Email:</span> <strong>{selectedBooking.client.email || "N/A"}</strong></div>
                      <div><span className="text-gray-500">Phone:</span> <strong>{selectedBooking.client.phone || "N/A"}</strong></div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-700 mb-3">📋 Booking Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <div className="text-gray-500">Check-in</div>
                        <div className="font-bold text-emerald-700">{selectedBooking.checkIn}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-gray-500">Check-out</div>
                        <div className="font-bold text-red-700">{selectedBooking.checkOut}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-gray-500">Guests</div>
                        <div className="font-bold text-blue-700">{selectedBooking.numberOfGuests}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-gray-500">Rooms</div>
                        <div className="font-bold text-purple-700">{selectedBooking.numberOfRooms || 1}</div>
                      </div>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <div className="text-gray-500 text-sm">Special Requests:</div>
                        <div className="text-gray-800">{selectedBooking.specialRequests}</div>
                      </div>
                    )}
                    {selectedBooking.totalCost && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="text-gray-500 text-sm">Proposed Cost:</div>
                        <div className="text-2xl font-bold text-green-700">${selectedBooking.totalCost}</div>
                      </div>
                    )}
                  </div>

                  {/* Receipt Image */}
                  {selectedBooking.receiptImageUrl && (
                    <div className="p-6 border-b">
                      <h3 className="font-semibold text-gray-700 mb-3">🧾 Payment Receipt</h3>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <img src={selectedBooking.receiptImageUrl} alt="Receipt" className="max-w-md rounded-lg border shadow" />
                      </div>
                    </div>
                  )}

                  {/* Problem Report */}
                  {selectedBooking.problemReported && selectedBooking.problemReport && (
                    <div className="p-6 border-b bg-red-50">
                      <h3 className="font-semibold text-red-700 mb-2">⚠️ Problem Reported by Client</h3>
                      <p className="text-red-800">{selectedBooking.problemReport}</p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedBooking.bookingStatus === BOOKING_STATUS.REJECTED && selectedBooking.rejectionReason && (
                    <div className="p-6 border-b bg-red-50">
                      <h3 className="font-semibold text-red-700 mb-2">❌ Rejection Reason</h3>
                      <p className="text-red-800">{selectedBooking.rejectionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-3">⚡ Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedBooking.bookingStatus === BOOKING_STATUS.REQUESTED && (
                        <>
                          <button
                            onClick={() => handleAccept(selectedBooking.bookingId)}
                            disabled={actionLoading}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            ✓ Accept Request
                          </button>
                          <button
                            onClick={() => setShowCostModal(true)}
                            disabled={actionLoading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                          >
                            💰 Propose Cost
                          </button>
                          <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {selectedBooking.bookingStatus === BOOKING_STATUS.OWNER_ACCEPTED && (
                        <>
                          <button
                            onClick={() => setShowCostModal(true)}
                            disabled={actionLoading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                          >
                            💰 Propose Cost
                          </button>
                          <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {selectedBooking.bookingStatus === BOOKING_STATUS.PAID && (
                        <>
                          <button
                            onClick={() => handleApprove(selectedBooking.bookingId)}
                            disabled={actionLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            ✓ Approve Booking
                          </button>
                          <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {selectedBooking.bookingStatus === BOOKING_STATUS.APPROVED && (
                        <div className="text-green-700 font-semibold">✓ This booking is approved and active</div>
                      )}
                      {selectedBooking.bookingStatus === BOOKING_STATUS.REJECTED && (
                        <div className="text-red-700 font-semibold">✗ This booking was rejected</div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">💬 Messages ({selectedBooking.messages?.length || 0})</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg">
                      {selectedBooking.messages?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No messages yet</p>
                      ) : (
                        selectedBooking.messages?.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-lg ${
                              m.senderId === userId ? "bg-emerald-100 ml-8" : "bg-white mr-8 border"
                            }`}
                          >
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span className="font-medium">{m.senderName}</span>
                              <span>{new Date(m.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-800">{m.message}</div>
                            {m.messageType !== "GENERAL" && (
                              <span className="text-xs text-gray-400 mt-1 block">[{m.messageType}]</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to the client..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
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
      </div>

      {/* Propose Cost Modal */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">💰 Propose Cost</h3>
            <p className="text-gray-600 mb-4">Enter the total cost for this booking:</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={proposedCost}
                onChange={(e) => setProposedCost(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCostModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleProposeCost}
                disabled={!proposedCost || actionLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading ? "Sending..." : "Send Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-600">❌ Reject Booking</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <div className="mb-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
