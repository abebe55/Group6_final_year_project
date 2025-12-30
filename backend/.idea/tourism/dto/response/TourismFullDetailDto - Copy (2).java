package com.northwollo.tourism.dto.response;

import lombok.Data;

import java.time.Duration;
import java.util.List;

@Data
public class TourismFullDetailDto {

    private Long id;
    private String name;
    private String description;
    private String wereda;
    private String kebele;
    private String bestTime;
    private String peaceInfo;
    private Duration visitTime;

    // ✅ FIXED: must be List<String>, not String
    private List<String> languages;

    private int viewersCount;

    // ======================
    // Related data
    // ======================
    private List<String> images;
    private List<NearbyTourismDto> nearbyPlaces;

    // Ratings
    private RatingSummaryResponseDto ratingSummary;
    private List<TourismRatingResponseDto> ratings;
}
