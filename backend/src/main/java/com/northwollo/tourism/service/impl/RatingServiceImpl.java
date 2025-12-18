package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.RatingRequestDto;
import com.northwollo.tourism.entity.Rating;
import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.repository.RatingRepository;
import com.northwollo.tourism.repository.TourismPlaceRepository;
import com.northwollo.tourism.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final TourismPlaceRepository tourismRepository;

    @Override
    public void addRating(RatingRequestDto dto) {
        // Find the tourism place
        TourismPlace place = tourismRepository.findById(dto.getTourismPlaceId())
                .orElseThrow(() -> new RuntimeException("Tourism place not found"));

        // Create rating
        Rating rating = new Rating();
        rating.setTourismPlace(place);  // ✅ Now works
        rating.setRating(dto.getRating());
        rating.setComment(dto.getComment());

        // Save rating
        ratingRepository.save(rating);
    }
}
