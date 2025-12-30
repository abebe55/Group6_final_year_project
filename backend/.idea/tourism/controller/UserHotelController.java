package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.response.HotelDetailInfoDto;
import com.northwollo.tourism.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotels")  // unchanged
@RequiredArgsConstructor
public class UserHotelController {

    private final HotelService hotelService;

    @GetMapping("/{id}/detail")
    public ResponseEntity<HotelDetailInfoDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelDetailInfo(id));
    }

    // 🔹 NEW endpoint for booking page
    @GetMapping("/{id}/booking")
    public ResponseEntity<HotelDetailInfoDto> booking(@PathVariable Long id) {
        HotelDetailInfoDto dto = hotelService.getHotelForBooking(id);
        return ResponseEntity.ok(dto);
    }
}
