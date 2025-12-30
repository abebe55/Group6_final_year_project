package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.BookingRequestDto;
import com.northwollo.tourism.dto.response.HotelBookingResponseDto;

import java.math.BigDecimal;
import java.util.List;

public interface BookingService {

    HotelBookingResponseDto createBooking(BookingRequestDto dto, Long userId);

    List<HotelBookingResponseDto> getMyBookings(Long userId);

    HotelBookingResponseDto proposeCost(Long bookingId, BigDecimal cost);

    HotelBookingResponseDto uploadReceipt(Long bookingId, String receiptUrl, Long userId);

    HotelBookingResponseDto approveBooking(Long bookingId);

    HotelBookingResponseDto rejectBooking(Long bookingId, String reason);
}
