package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.response.HotelSummaryDto;
import com.northwollo.tourism.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tourisms")
@RequiredArgsConstructor
public class TourismController {

    private final HotelService hotelService;

    @GetMapping("/{id}/hotels")  // ✅ THIS WAS MISSING!
    public ResponseEntity<List<HotelSummaryDto>> getHotelsByTourism(@PathVariable Long id) {
        List<HotelSummaryDto> hotels = hotelService.getHotels(id);
        return ResponseEntity.ok(hotels);
    }
}
