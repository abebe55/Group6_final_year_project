package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.response.SearchResultDto;
import com.northwollo.tourism.dto.response.TourismListDto;
import com.northwollo.tourism.enums.TourismCategory;
import org.springframework.data.domain.Pageable;

public interface SearchService {

    SearchResultDto<TourismListDto> searchTourismPlaces(
            TourismCategory category,
            Pageable pageable
    );
}
