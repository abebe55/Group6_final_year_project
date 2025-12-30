package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.TourismCreateDto;
import com.northwollo.tourism.dto.request.TourismUpdateDto;
import com.northwollo.tourism.dto.response.*;
import com.northwollo.tourism.entity.TourismImage;
import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.entity.TourismRating;
import com.northwollo.tourism.enums.PlaceStatus;
import com.northwollo.tourism.enums.TourismCategory;
import com.northwollo.tourism.exception.ResourceNotFoundException;
import com.northwollo.tourism.repository.TourismPlaceRepository;
import com.northwollo.tourism.repository.TourismRatingRepository;
import com.northwollo.tourism.service.TourismService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourismServiceImpl implements TourismService {

    private final TourismPlaceRepository tourismRepository;
    private final TourismRatingRepository ratingRepository;

    @Override
    @Transactional
    public Long create(TourismCreateDto dto) {
        TourismPlace place = new TourismPlace();
        place.setName(dto.getName());
        place.setCategory(dto.getCategory());
        place.setDescription(dto.getDescription());
        place.setWereda(dto.getWereda());
        place.setKebele(dto.getKebele());
        place.setBestTime(dto.getBestTime());
        place.setPeaceInfo(dto.getPeaceInfo());
        place.setStatus(PlaceStatus.ACTIVE);
        place.setViewersCount(0);

        // ✅ Languages parsing
        if (dto.getLanguages() != null && !dto.getLanguages().isBlank()) {
            place.setLanguages(Arrays.asList(dto.getLanguages().split(",")));
        }

        // ✅ Visit time parsing
        if (dto.getVisitTime() != null && !dto.getVisitTime().isBlank()) {
            place.setVisitTime(Duration.parse(dto.getVisitTime()));
        }

        // ✅ Main image
        if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            TourismImage mainImage = new TourismImage();
            mainImage.setImageUrl(dto.getImageUrl());
            mainImage.setTourismPlace(place);
            place.getImages().add(mainImage);
        }

        return tourismRepository.save(place).getId();
    }

    @Override
    @Transactional
    public void update(Long id, TourismUpdateDto dto) {
        TourismPlace place = tourismRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tourism place not found: " + id));

        // ✅ Safe null checks for all fields
        if (dto.getName() != null) place.setName(dto.getName());
        if (dto.getCategory() != null) place.setCategory(dto.getCategory());
        if (dto.getDescription() != null) place.setDescription(dto.getDescription());
        if (dto.getWereda() != null) place.setWereda(dto.getWereda());
        if (dto.getKebele() != null) place.setKebele(dto.getKebele());
        if (dto.getBestTime() != null) place.setBestTime(dto.getBestTime());
        if (dto.getPeaceInfo() != null) place.setPeaceInfo(dto.getPeaceInfo());

        if (dto.getLanguages() != null) place.setLanguages(dto.getLanguages());
        if (dto.getStatus() != null) place.setStatus(dto.getStatus());

        // ✅ Visit time parsing with null check
        if (dto.getVisitTime() != null && !dto.getVisitTime().isBlank()) {
            place.setVisitTime(Duration.parse(dto.getVisitTime()));
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!tourismRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tourism place not found: " + id);
        }
        tourismRepository.deleteById(id);
    }


    @Override
    @Transactional
    public TourismFullDetailDto getFullDetail(Long placeId) {
        TourismPlace place = tourismRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Tourism place not found: " + placeId));

        // ✅ Atomic viewer increment
        tourismRepository.incrementViewersCount(placeId);

        // ✅ Build full DTO (same as before...)
        TourismFullDetailDto dto = new TourismFullDetailDto();
        dto.setId(place.getId());
        dto.setName(place.getName());
        dto.setDescription(place.getDescription());
        dto.setWereda(place.getWereda());
        dto.setKebele(place.getKebele());
        dto.setBestTime(place.getBestTime());
        dto.setPeaceInfo(place.getPeaceInfo());
        dto.setVisitTime(place.getVisitTime());
        dto.setLanguages(place.getLanguages());
        dto.setViewersCount(place.getViewersCount());


        // ✅ Images
        dto.setImages(place.getImages().stream()
                .map(TourismImage::getImageUrl)
                .collect(Collectors.toList()));

        // ✅ FIXED: Use new nearby method + limit 5 in service
        dto.setNearbyPlaces(tourismRepository.findNearbyByKebeleAndIdNotAndStatus(
                        place.getKebele(), place.getId(), PlaceStatus.ACTIVE)
                .stream()
                .limit(5)  // ✅ Service layer limit
                .map(NearbyTourismDto::fromEntity)
                .collect(Collectors.toList()));

        // ✅ Ratings (same)
        List<TourismRating> ratings = ratingRepository.findByTourismPlaceId(placeId);
        List<TourismRatingResponseDto> ratingDtos = ratings.stream()
                .map(TourismRatingResponseDto::fromEntity)
                .collect(Collectors.toList());
        dto.setRatings(ratingDtos);

        double avgRating = ratings.isEmpty() ? 0.0 :
                ratings.stream().mapToInt(TourismRating::getRating).average().orElse(0.0);
        dto.setRatingSummary(new RatingSummaryResponseDto(avgRating, (long) ratings.size()));

        return dto;
    }








}
