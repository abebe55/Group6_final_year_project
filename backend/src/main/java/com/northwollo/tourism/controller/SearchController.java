package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.response.SearchResultDto;
import com.northwollo.tourism.dto.response.TourismListDto;
import com.northwollo.tourism.enums.TourismCategory;
import com.northwollo.tourism.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/tourism")
    public SearchResultDto<TourismListDto> search(
            @RequestParam(required = false) TourismCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "viewersCount") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction
    ) {
        return searchService.searchTourismPlaces(
                category,
                PageRequest.of(page, size, Sort.by(direction, sortBy))
        );
    }
}
