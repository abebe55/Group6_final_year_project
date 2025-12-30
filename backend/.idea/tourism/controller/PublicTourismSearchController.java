package com.northwollo.tourism.controller;

import com.northwollo.tourism.publicsearch.dto.PublicTourismSearchRequestDto;
import com.northwollo.tourism.dto.response.PublicTourismSearchResponseDto;  // ✅ FIXED IMPORT
import com.northwollo.tourism.service.PublicTourismSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tourisms/public")
@RequiredArgsConstructor
public class PublicTourismSearchController {

    private final PublicTourismSearchService service;

    @GetMapping("/search")
    public List<PublicTourismSearchResponseDto> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String kebele,
            @RequestParam(required = false) String wereda,
            @RequestParam(required = false) List<String> categories
    ) {

        PublicTourismSearchRequestDto request = new PublicTourismSearchRequestDto();

        request.setKeyword(keyword);
        request.setKebele(kebele);
        request.setWereda(wereda);

        if (categories != null) {
            request.setCategories(
                    categories.stream()
                            .map(c -> Enum.valueOf(
                                    com.northwollo.tourism.enums.TourismCategory.class, c))
                            .collect(java.util.stream.Collectors.toSet())
            );
        }

        return service.search(request);
    }
}
