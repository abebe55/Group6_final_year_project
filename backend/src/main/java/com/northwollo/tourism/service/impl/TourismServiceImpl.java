package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.TourismCreateDto;
import com.northwollo.tourism.dto.request.TourismUpdateDto;
import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.enums.PlaceStatus;
import com.northwollo.tourism.exception.ResourceNotFoundException;
import com.northwollo.tourism.repository.TourismPlaceRepository;
import com.northwollo.tourism.service.TourismService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Transactional
public class TourismServiceImpl implements TourismService {

    private final TourismPlaceRepository repository;

    @Override
    public Long create(TourismCreateDto dto) {
        TourismPlace place = new TourismPlace();
        place.setName(dto.getName());
        place.setCategory(dto.getCategory());
        place.setDescription(dto.getDescription());
        place.setWereda(dto.getWereda());
        place.setKebele(dto.getKebele());
        place.setBestTime(dto.getBestTime());
        place.setPeaceInfo(dto.getPeaceInfo());
        place.setLanguages(dto.getLanguages());
        place.setImageUrl(dto.getImageUrl()); // optional
        place.setStatus(PlaceStatus.ACTIVE);
        place.setViewersCount(0);

        // Convert visitTime string to Duration if present
        if (dto.getVisitTime() != null && !dto.getVisitTime().isBlank()) {
            place.setVisitTime(Duration.parse(dto.getVisitTime()));
        }

        repository.save(place);
        return place.getId();
    }

    @Override
    public void update(Long id, TourismUpdateDto dto) {
        TourismPlace place = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tourism place not found with id: " + id));

        if (dto.getName() != null) place.setName(dto.getName());
        if (dto.getCategory() != null) place.setCategory(dto.getCategory());
        if (dto.getDescription() != null) place.setDescription(dto.getDescription());
        if (dto.getWereda() != null) place.setWereda(dto.getWereda());
        if (dto.getKebele() != null) place.setKebele(dto.getKebele());
        place.setBestTime(dto.getBestTime());
        place.setPeaceInfo(dto.getPeaceInfo());
        place.setLanguages(dto.getLanguages());
        place.setImageUrl(dto.getImageUrl());
        place.setStatus(dto.getStatus());

        // Convert visitTime string to Duration if present
        if (dto.getVisitTime() != null && !dto.getVisitTime().isBlank()) {
            place.setVisitTime(Duration.parse(dto.getVisitTime()));
        }

        repository.save(place);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Tourism place not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public void block(Long id) {
        TourismPlace place = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tourism place not found with id: " + id));
        place.setStatus(PlaceStatus.BLOCKED);
        repository.save(place);
    }

    @Override
    public void unblock(Long id) {
        TourismPlace place = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tourism place not found with id: " + id));
        place.setStatus(PlaceStatus.ACTIVE);
        repository.save(place);
    }
}
