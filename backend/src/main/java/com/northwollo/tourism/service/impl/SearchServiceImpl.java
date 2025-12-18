package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.response.SearchResultDto;
import com.northwollo.tourism.dto.response.TourismListDto;
import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.enums.TourismCategory;
import com.northwollo.tourism.repository.TourismPlaceRepository;
import com.northwollo.tourism.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final TourismPlaceRepository repository;

    @Override
    public SearchResultDto<TourismListDto> searchTourismPlaces(
            TourismCategory category,
            Pageable pageable) {

        Page<TourismPlace> page = (category == null)
                ? repository.findAll(pageable)
                : repository.findByCategory(category, pageable);

        SearchResultDto<TourismListDto> result = new SearchResultDto<>();
        result.setContent(
                page.getContent().stream().map(this::mapToDto).toList()
        );
        result.setPage(pageable.getPageNumber());
        result.setSize(pageable.getPageSize());
        result.setTotalElements(page.getTotalElements());

        return result;
    }

    private TourismListDto mapToDto(TourismPlace place) {
        TourismListDto dto = new TourismListDto();
        dto.setId(place.getId());
        dto.setName(place.getName());
        dto.setViewersCount(place.getViewersCount());
        return dto;
    }
}
