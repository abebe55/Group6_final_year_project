package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.TourismCreateDto;
import com.northwollo.tourism.dto.request.TourismUpdateDto;
import com.northwollo.tourism.dto.response.TourismFullDetailDto;
import com.northwollo.tourism.dto.response.TourismPublicCardDto;
import com.northwollo.tourism.enums.TourismCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TourismService {

    // ==============================
    // Admin CRUD
    // ==============================
    Long create(TourismCreateDto dto);
    void update(Long id, TourismUpdateDto dto);
    void delete(Long id);

    // ==============================
    // Public listing - FRONTEND USES THIS
    // ==============================

    // ==============================
    // Public detail
    // ==============================
    TourismFullDetailDto getFullDetail(Long placeId);
}
