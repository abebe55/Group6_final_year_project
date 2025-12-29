"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import TopBar from "@/components/layout/TopBar";
import { BookingService, Booking, BOOKING_STATUS } from "@/services/booking.service";

export default function HotelOwnerDashboard() {
  const router = useRouter();
  const { isAuthenticated, token, userId, role } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [costInput, setCostInput] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (role !== "HOTEL_OWNER" && role !== "ADMIN") {
      router.push("/");
      return;
    }
    loadBookings();
  }, [isAuthenticated, role]);

  const loadBookings = async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      const data = await BookingService.getOwnerBookings(token, userId);
      setBookings(data);
      if (data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0]);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: number) => {
    if (!token || !userId) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.acceptBookingRequest(token, bookingId, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
    } catch (err) {
      alert("Failed to accept booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposeCost = async (bookingId: number) => {
    if (!token || !userId || !costInput) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.proposeCost(token, bookingId, parseFloat(costInput), userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setCostInput("");
    } catch (err) {
      alert("Failed to propose cost");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (bookingId: number) => {
    if (!token || !userId) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.approveBooking(token, bookingId, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
    } catch (err) {
      alert("Failed to approve booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!token || !userId || !rejectReason) return;
    try {
      setSubmitting(true);
      const updated = await BookingService.rejectBooking(token, bookingId, rejectReason, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setRejectReason("");
    } catch (err) {
      alert("Failed to reject booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !userId || !selectedBooking || !newMessage) return;
    try {
      const updated = await BookingService.ownerSendMessage(token, selectedBooking.bookingId, newMessage, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setNewMessage("");
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const updateBookingInList = (updated: Booking) => {
    setBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === "all") return true;
    if (filter === "pending") return b.bookingStatus === BOOKING_STATUS.REQUESTED;
    if (filter === "active") return [BOOKING_STATUS.OWNER_ACCEPTED, BOOKING_STATUS.COST_PROPOSED, BOOKING_STATUS.PAID].includes(b.bookingStatus);
    if (filter === "approved") return b.bookingStatus === BOOKING_STATUS.APPROVED;
    if (filter === "problems") return b.problemReported;
    return true;
  });

  const pendingCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.REQUESTED).length;
  const paidCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.PAID).length;
  const problemCount = bookings.filter(b => b.problemReported).length;

  if (!isAuthenticated || (role !== "HOTEL_OWNER" && role !== "ADMIN")) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Owner Dashboard</h1>
            <p className="text-gray-600">Manage your hotel bookings</p>
          </div>
          <button onClick={loadBookings} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-yellow-700">Pending Review</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-200">
            <div className="text-3xl font-bold text-indigo-600">{paidCount}</div>
            <div className="text-indigo-700">Awaiting Approval</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
            <div className="text-3xl font-bold text-red-600">{problemCount}</div>
            <div className="text-red-700">Problems Reported</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "active", label: "In Progress" },
            { key: "approved", label: "Approved" },
            { key: "problems", label: `Problems (${problemCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === tab.key ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center text-gray-500">
                  No bookings found
                </div>
              ) : (
                filteredBookings.map(booking => (
                  <div
                    key={booking.bookingId}
                    onClick={() => setSelectedBooking(booking)}
                    className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 transition-all ${
                      selectedBooking?.bookingId === booking.bookingId
                        ? "border-emerald-500"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{booking.client.fullName || booking.client.username}</div>
                        <div className="text-sm text-gray-500">#{booking.bookingId}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${BookingService.getStatusColor(booking.bookingStatus)}`}>
                        {BookingService.getStatusLabel(booking.bookingStatus)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.checkIn} → {booking.checkOut}
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.numberOfGuests} guests • {booking.numberOfRooms || 1} room(s)
                    </div>
                    {booking.problemReported && (
                      <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Problem Reported</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Booking Details */}
            <div className="lg:col-span-2">
              {selectedBooking ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedBooking.hotel.name}</h2>
                      <p className="text-gray-600">Booking #{selectedBooking.bookingId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full ${BookingService.getStatusColor(selectedBooking.bookingStatus)}`}>
                      {BookingService.getStatusLabel(selectedBooking.bookingStatus)}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-2">👤 Client Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Name: <strong>{selectedBooking.client.fullName || selectedBooking.client.username}</strong></div>
                      <div>Email: <strong>{selectedBooking.client.email || "N/A"}</strong></div>
                      <div>Check-in: <strong>{selectedBooking.checkIn}</strong></div>
                      <div>Check-out: <strong>{selectedBooking.checkOut}</strong></div>
                      <div>Guests: <strong>{selectedBooking.numberOfGuests}</strong></div>
                      <div>Rooms: <strong>{selectedBooking.numberOfRooms || 1}</strong></div>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <strong>Special Requests:</strong> {selectedBooking.specialRequests}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons based on status */}
                  {selectedBooking.bookingStatus === BOOKING_STATUS.REQUESTED && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-yellow-800 mb-3">📋 New Booking Request</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(selectedBooking.bookingId)}
                          disabled={submitting}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                        >
                          ✓ Accept Request
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) {
                              setRejectReason(reason);
                              handleReject(selectedBooking.bookingId);
                            }
                          }}
                          disabled={submitting}
                          className="px-4 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedBooking.bookingStatus === BOOKING_STATUS.OWNER_ACCEPTED && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-blue-800 mb-3">💰 Propose Cost</h3>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={costInput}
                          onChange={(e) => setCostInput(e.target.value)}
                          placeholder="Enter total cost (ETB)"
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <button
                          onClick={() => handleProposeCost(selectedBooking.bookingId)}
                          disabled={submitting || !costInput}
                          className="px-6 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          Send Cost
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedBooking.bookingStatus === BOOKING_STATUS.COST_PROPOSED && (
                    <div className="bg-purple-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-purple-800 mb-2">⏳ Waiting for Payment</h3>
                      <p className="text-purple-700">Cost proposed: <strong>{selectedBooking.totalCost} ETB</strong></p>
                      <p className="text-sm text-purple-600">Waiting for client to upload payment receipt...</p>
                    </div>
                  )}

                  {selectedBooking.bookingStatus === BOOKING_STATUS.PAID && (
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-indigo-800 mb-3">🧾 Payment Received - Review Receipt</h3>
                      {selectedBooking.receiptImageUrl && (
                        <div className="mb-4">
                          <img
                            src={selectedBooking.receiptImageUrl}
                            alt="Payment Receipt"
                            className="max-w-sm rounded-lg border shadow-sm"
                          />
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(selectedBooking.bookingId)}
                          disabled={submitting}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ Approve Booking
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) {
                              setRejectReason(reason);
                              handleReject(selectedBooking.bookingId);
                            }
                          }}
                          disabled={submitting}
                          className="px-4 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedBooking.bookingStatus === BOOKING_STATUS.APPROVED && (
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-green-800">✓ Booking Approved</h3>
                      <p className="text-green-700">This booking is confirmed until {selectedBooking.checkOut}</p>
                    </div>
                  )}

                  {selectedBooking.bookingStatus === BOOKING_STATUS.REJECTED && (
                    <div className="bg-red-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-red-800">✗ Booking Rejected</h3>
                      <p className="text-red-700">Reason: {selectedBooking.rejectionReason}</p>
                    </div>
                  )}

                  {/* Problem Report */}
                  {selectedBooking.problemReported && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-red-800 mb-2">⚠️ Problem Reported to Admin</h3>
                      <p className="text-red-700">{selectedBooking.problemReport}</p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">💬 Messages</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                      {selectedBooking.messages?.length > 0 ? (
                        selectedBooking.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-lg ${
                              m.senderId === userId ? "bg-emerald-50 ml-8" : "bg-gray-50 mr-8"
                            }`}
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {m.senderName} • {new Date(m.createdAt).toLocaleString()}
                            </div>
                            <div>{m.message}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No messages yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to the client..."
                        className="flex-1 border rounded-lg px-3 py-2"
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage}
                        className="px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                  Select a booking to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
