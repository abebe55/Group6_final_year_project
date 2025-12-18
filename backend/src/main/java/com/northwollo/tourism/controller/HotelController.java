package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.request.HotelCreateDto;
import com.northwollo.tourism.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @PostMapping
    public ResponseEntity<Long> create(
            @Valid @RequestBody HotelCreateDto dto) {
        return ResponseEntity.ok(hotelService.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hotelService.delete(id);
        return ResponseEntity.ok().build();
    }
}
