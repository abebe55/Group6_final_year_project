"use client";

import { useEffect, useState } from "react";
import { getTourismRatings, addTourismRating } from "@/services/rating.service";
import { TourismRatingResponseDto, TourismRatingRequestDto } from "@/types/rating";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  tourismId: number;
}

export default function TourismRatingTab({ tourismId }: Props) {
  const { username } = useAuthStore();
  const [ratings, setRatings] = useState<TourismRatingResponseDto[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const loadRatings = async () => {
    const data = await getTourismRatings(tourismId);
    setRatings(data);
  };

  useEffect(() => {
    loadRatings();
  }, [tourismId]);

  const handleAddRating = async () => {
    if (!username) return alert("Login required to rate.");
    const dto: TourismRatingRequestDto = {
      tourismPlaceId: tourismId,
      rating: newRating,
      comment,
    };
    await addTourismRating(dto, username);
    setComment("");
    setNewRating(5);
    loadRatings();
  };

  return (
    <div className="space-y-4">
      {/* Add Rating */}
      <div className="border p-4 rounded-md shadow-sm">
        <h3 className="font-semibold mb-2">Add Your Rating</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={5}
            value={newRating}
            onChange={e => setNewRating(Number(e.target.value))}
            className="border rounded px-2 py-1 w-16"
          />
          <input
            type="text"
            placeholder="Comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
          />
          <button onClick={handleAddRating} className="bg-green-700 text-white px-4 py-1 rounded">
            Submit
          </button>
        </div>
      </div>

     {ratings.map(r => (
  <div key={r.id} className="border p-2 rounded-md shadow-sm">
    <p className="font-semibold">{r.userFullName}</p> {/* ✅ Fixed */}
    <p>Rating: {r.rating}/5</p>
    <p>{r.comment}</p>
  </div>
))}

    </div>
  );
}
