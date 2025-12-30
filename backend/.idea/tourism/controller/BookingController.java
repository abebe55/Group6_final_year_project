package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.request.BookingRequestDto;
import com.northwollo.tourism.dto.response.HotelBookingResponseDto;
import com.northwollo.tourism.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /* USER */

    @PostMapping
    public HotelBookingResponseDto createBooking(
            @RequestBody BookingRequestDto dto,
            @RequestParam Long userId
    ) {
        return bookingService.createBooking(dto, userId);
    }

    @GetMapping("/my")
    public List<HotelBookingResponseDto> myBookings(@RequestParam Long userId) {
        return bookingService.getMyBookings(userId);
    }

    @PostMapping("/{id}/receipt")
    public HotelBookingResponseDto uploadReceipt(
            @PathVariable Long id,
            @RequestParam String receiptUrl,
            @RequestParam Long userId
    ) {
        return bookingService.uploadReceipt(id, receiptUrl, userId);
    }

    /* ADMIN */

    @PostMapping("/{id}/cost")
    public HotelBookingResponseDto proposeCost(
            @PathVariable Long id,
            @RequestParam BigDecimal cost
    ) {
        return bookingService.proposeCost(id, cost);
    }

    @PostMapping("/{id}/approve")
    public HotelBookingResponseDto approve(@PathVariable Long id) {
        return bookingService.approveBooking(id);
    }

    @PostMapping("/{id}/reject")
    public HotelBookingResponseDto reject(@PathVariable Long id,
                                          @RequestParam String reason) {
        return bookingService.rejectBooking(id, reason);
    }
}
