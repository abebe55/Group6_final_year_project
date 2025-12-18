package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.request.RatingRequestDto;
import com.northwollo.tourism.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<Void> addRating(
            @Valid @RequestBody RatingRequestDto dto) {
        ratingService.addRating(dto);
        return ResponseEntity.ok().build();
    }
}
