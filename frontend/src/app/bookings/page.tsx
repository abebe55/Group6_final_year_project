"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import TopBar from "@/components/layout/TopBar";
import { BookingService, Booking, BOOKING_STATUS } from "@/services/booking.service";
import { API_BASE_URL } from "@/services/api";

export default function ClientBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, token, userId, username } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [receiptUrl, setReceiptUrl] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [problemReport, setProblemReport] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await BookingService.getMyBookings(token, userId);
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

  const handleUploadReceipt = async () => {
    if (!token || !userId || !selectedBooking || !receiptUrl.trim()) return;
    try {
      setActionLoading(true);
      const updated = await BookingService.uploadReceipt(token, selectedBooking.bookingId, receiptUrl, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setReceiptUrl("");
      setShowReceiptModal(false);
      alert("Receipt uploaded successfully! The hotel owner will review it.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload receipt");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !userId || !selectedBooking || !newMessage.trim()) return;
    try {
      const updated = await BookingService.sendMessage(token, selectedBooking.bookingId, newMessage, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setNewMessage("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleReportProblem = async () => {
    if (!token || !userId || !selectedBooking || !problemReport.trim()) return;
    try {
      setActionLoading(true);
      const updated = await BookingService.reportProblem(token, selectedBooking.bookingId, problemReport, userId);
      updateBookingInList(updated);
      setSelectedBooking(updated);
      setProblemReport("");
      setShowProblemModal(false);
      alert("Problem reported to admin. They will contact you soon.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to report problem");
    } finally {
      setActionLoading(false);
    }
  };

  const updateBookingInList = (updated: Booking) => {
    setBookings(prev => prev.map(b => b.bookingId === updated.bookingId ? updated : b));
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.OWNER_ACCEPTED, BOOKING_STATUS.COST_PROPOSED, BOOKING_STATUS.PAID].includes(b.bookingStatus);
    if (filter === "APPROVED") return b.bookingStatus === BOOKING_STATUS.APPROVED;
    if (filter === "COMPLETED") return [BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED].includes(b.bookingStatus);
    return b.bookingStatus === filter;
  });

  // Stats
  const activeCount = bookings.filter(b => [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.OWNER_ACCEPTED, BOOKING_STATUS.COST_PROPOSED, BOOKING_STATUS.PAID].includes(b.bookingStatus)).length;
  const approvedCount = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.APPROVED).length;
  const needsPayment = bookings.filter(b => b.bookingStatus === BOOKING_STATUS.COST_PROPOSED).length;

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            <h1 className="text-3xl font-bold text-gray-900">📋 My Bookings</h1>
            <p className="text-gray-600 mt-1">Track and manage your hotel reservations</p>
          </div>
          <button onClick={loadBookings} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
            <div className="text-gray-600 text-sm">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">{needsPayment}</div>
            <div className="text-gray-600 text-sm">Awaiting Payment</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-gray-600 text-sm">Approved</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "ACTIVE", "APPROVED", "COMPLETED"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Start exploring hotels and make your first reservation!</p>
            <button
              onClick={() => router.push('/tourisms')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              🏨 Browse Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
              <h2 className="font-semibold text-gray-700 sticky top-0 bg-gray-100 py-2">
                Bookings ({filteredBookings.length})
              </h2>
              {filteredBookings.map(b => (
                <div
                  key={b.bookingId}
                  onClick={() => setSelectedBooking(b)}
                  className={`bg-white rounded-lg p-4 cursor-pointer border-2 transition hover:shadow-md ${
                    selectedBooking?.bookingId === b.bookingId ? "border-blue-500 shadow-md" : "border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">#{b.bookingId}</span>
                      {b.problemReported && <span className="ml-2 text-red-500">⚠️</span>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${BookingService.getStatusColor(b.bookingStatus)}`}>
                      {BookingService.getStatusLabel(b.bookingStatus)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-800">🏨 {b.hotel.name}</div>
                    <div>📅 {b.checkIn} → {b.checkOut}</div>
                    <div>👥 {b.numberOfGuests} guests {b.numberOfRooms && `• ${b.numberOfRooms} rooms`}</div>
                    {b.totalCost && <div className="text-green-600 font-medium">💰 {b.totalCost} ETB</div>}
                  </div>
                </div>
              ))}
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

                  {/* Status Progress */}
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-4">📊 Booking Progress</h3>
                    <div className="flex items-center justify-between">
                      {[
                        { status: 'REQUESTED', label: 'Requested', icon: '📝' },
                        { status: 'OWNER_ACCEPTED', label: 'Accepted', icon: '✓' },
                        { status: 'COST_PROPOSED', label: 'Cost Sent', icon: '💰' },
                        { status: 'PAID', label: 'Paid', icon: '🧾' },
                        { status: 'APPROVED', label: 'Approved', icon: '✅' },
                      ].map((step, idx) => {
                        const statusOrder = ['REQUESTED', 'OWNER_ACCEPTED', 'COST_PROPOSED', 'PAID', 'APPROVED'];
                        const currentIdx = statusOrder.indexOf(selectedBooking.bookingStatus);
                        const stepIdx = statusOrder.indexOf(step.status);
                        const isCompleted = stepIdx <= currentIdx;
                        const isCurrent = step.status === selectedBooking.bookingStatus;
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              isCompleted ? 'bg-green-500 text-white' : 
                              isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {step.icon}
                            </div>
                            <span className={`text-xs mt-1 ${isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                            {idx < 4 && (
                              <div className={`h-0.5 w-full mt-5 absolute ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} style={{ display: 'none' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedBooking.bookingStatus === BOOKING_STATUS.REJECTED && (
                      <div className="mt-4 p-3 bg-red-100 rounded-lg text-red-700 text-sm">
                        ❌ This booking was rejected. Reason: {selectedBooking.rejectionReason || 'Not specified'}
                      </div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-700 mb-3">🏨 Hotel Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Hotel:</span> <strong>{selectedBooking.hotel.name}</strong></div>
                      <div><span className="text-gray-500">Contact:</span> <strong>{selectedBooking.hotel.contactInfo || 'N/A'}</strong></div>
                      <div><span className="text-gray-500">Owner:</span> <strong>{selectedBooking.hotel.ownerName || 'N/A'}</strong></div>
                      <div><span className="text-gray-500">Status:</span> 
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${selectedBooking.hotel.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedBooking.hotel.active ? 'Active' : 'Inactive'}
                        </span>
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
                  </div>

                  {/* Cost & Payment Section */}
                  {selectedBooking.totalCost && (
                    <div className="p-6 border-b bg-green-50">
                      <h3 className="font-semibold text-green-700 mb-3">💰 Payment Information</h3>
                      <div className="text-center mb-4">
                        <div className="text-gray-500 text-sm">Total Cost</div>
                        <div className="text-4xl font-bold text-green-700">{selectedBooking.totalCost} ETB</div>
                      </div>
                      
                      {selectedBooking.bookingStatus === BOOKING_STATUS.COST_PROPOSED && (
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <p className="text-green-700 mb-3">
                            💳 The hotel owner has proposed a cost. Please upload your payment receipt to proceed.
                          </p>
                          <button
                            onClick={() => setShowReceiptModal(true)}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                          >
                            📤 Upload Payment Receipt
                          </button>
                        </div>
                      )}
                      
                      {selectedBooking.bookingStatus === BOOKING_STATUS.PAID && (
                        <div className="bg-white p-4 rounded-lg border border-indigo-200">
                          <p className="text-indigo-700">
                            ⏳ Your payment receipt has been uploaded. Waiting for hotel owner to verify and approve.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Receipt Image */}
                  {selectedBooking.receiptImageUrl && (
                    <div className="p-6 border-b">
                      <h3 className="font-semibold text-gray-700 mb-3">🧾 Your Payment Receipt</h3>
                      <img src={selectedBooking.receiptImageUrl} alt="Receipt" className="max-w-md rounded-lg border shadow" />
                    </div>
                  )}

                  {/* Approved Status */}
                  {selectedBooking.bookingStatus === BOOKING_STATUS.APPROVED && (
                    <div className="p-6 border-b bg-green-50">
                      <div className="text-center">
                        <div className="text-6xl mb-3">✅</div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">Booking Approved!</h3>
                        <p className="text-green-600">
                          Your reservation is confirmed from {selectedBooking.checkIn} to {selectedBooking.checkOut}
                        </p>
                        <p className="text-gray-600 mt-2">
                          Contact the hotel at: {selectedBooking.hotel.contactInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Problem Report */}
                  {selectedBooking.problemReported && selectedBooking.problemReport && (
                    <div className="p-6 border-b bg-red-50">
                      <h3 className="font-semibold text-red-700 mb-2">⚠️ Problem Reported</h3>
                      <p className="text-red-800">{selectedBooking.problemReport}</p>
                      <p className="text-sm text-red-600 mt-2">Admin has been notified and will contact you.</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-3">⚡ Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedBooking.bookingStatus === BOOKING_STATUS.COST_PROPOSED && (
                        <button
                          onClick={() => setShowReceiptModal(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                          📤 Upload Receipt
                        </button>
                      )}
                      {!selectedBooking.problemReported && selectedBooking.bookingStatus !== BOOKING_STATUS.REJECTED && (
                        <button
                          onClick={() => setShowProblemModal(true)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                        >
                          ⚠️ Report Problem
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/hotels/${selectedBooking.hotel.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        🏨 View Hotel
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">💬 Conversation ({selectedBooking.messages?.length || 0})</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg">
                      {selectedBooking.messages?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No messages yet</p>
                      ) : (
                        selectedBooking.messages?.map(m => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-lg ${
                              m.senderId === userId ? "bg-blue-100 ml-8" : "bg-white mr-8 border"
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
                        placeholder="Type a message to the hotel owner..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send
                      </button>
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
      </div>

      {/* Upload Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">📤 Upload Payment Receipt</h3>
            <p className="text-gray-600 mb-4">
              Enter the URL of your payment receipt image. You can upload the image to a service like Imgur or Google Drive and paste the link here.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image URL</label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/receipt.jpg"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowReceiptModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleUploadReceipt}
                disabled={!receiptUrl.trim() || actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? "Uploading..." : "Upload Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Report a Problem</h3>
            <p className="text-gray-600 mb-4">
              Describe the issue you're experiencing. The admin will be notified and will contact both you and the hotel owner.
            </p>
            <div className="mb-4">
              <textarea
                value={problemReport}
                onChange={(e) => setProblemReport(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Describe your problem..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowProblemModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleReportProblem}
                disabled={!problemReport.trim() || actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Reporting..." : "Report Problem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
