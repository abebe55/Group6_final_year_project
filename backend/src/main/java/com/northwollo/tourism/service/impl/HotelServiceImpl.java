package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.HotelCreateDto;
import com.northwollo.tourism.entity.Hotel;
import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.repository.HotelRepository;
import com.northwollo.tourism.repository.TourismPlaceRepository;
import com.northwollo.tourism.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final TourismPlaceRepository tourismRepository;

    @Override
    public Long create(HotelCreateDto dto) {
        // Fetch the related tourism place
        TourismPlace place = tourismRepository.findById(dto.getTourismPlaceId())
                .orElseThrow(() -> new RuntimeException("Tourism place not found with ID: " + dto.getTourismPlaceId()));

        // Map DTO to entity
        Hotel hotel = new Hotel();
        hotel.setTourismPlace(place);
        hotel.setName(dto.getName());
        hotel.setStarRating(dto.getStarRating());
        hotel.setContactInfo(dto.getContactInfo());
        hotel.setBookingSteps(dto.getBookingSteps());
        hotel.setPolicies(dto.getPolicies());

        // Save and return ID
        hotelRepository.save(hotel);
        return hotel.getId();
    }

    @Override
    public void delete(Long id) {
        if (!hotelRepository.existsById(id)) {
            throw new RuntimeException("Hotel not found with ID: " + id);
        }
        hotelRepository.deleteById(id);
    }
}
