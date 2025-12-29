"use client";

import { useState } from "react";
import { bookHorseService } from "@/services/booking.service";

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: number;
  ownerName?: string;
}

export default function HorseBookingModal({ open, onClose, serviceId, ownerName }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await bookHorseService(serviceId, { name, phone, date: date || undefined, notes: notes || undefined });
      alert(`Booking request sent to ${ownerName ?? 'horse service'}.`);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-2">Book Horse Service{ownerName ? ` — ${ownerName}` : ''}</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input required value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">{loading ? 'Sending...' : 'Send Booking'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
