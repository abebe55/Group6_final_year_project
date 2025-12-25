// frontend/src/components/tourism/TourismRatings.tsx

"use client";

import React from "react";
import { TourismRatingResponseDto, RatingSummaryResponseDto } from "../../types/tourism";

interface Props {
  ratings: TourismRatingResponseDto[];
  summary: RatingSummaryResponseDto;
}

const TourismRatings: React.FC<Props> = ({ ratings, summary }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">
        Ratings (Average: {summary.averageRating.toFixed(1)} / 5)
      </h2>
      <p>Total Ratings: {summary.totalRatings}</p>

      {ratings.map((r) => (
        <div key={r.id} className="border rounded p-2">
          <p className="font-semibold">User ID: {r.userId}</p>
          <p>Rating: {r.rating} / 5</p>
          {r.comment && <p>Comment: {r.comment}</p>}
          <p className="text-xs text-gray-500">{r.createdAt}</p>
        </div>
      ))}
    </div>
  );
};

export default TourismRatings;
