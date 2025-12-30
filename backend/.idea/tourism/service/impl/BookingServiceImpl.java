package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.dto.request.BookingRequestDto;
import com.northwollo.tourism.dto.response.HotelBookingResponseDto;
import com.northwollo.tourism.entity.BookingStatusEntity;
import com.northwollo.tourism.entity.Hotel;
import com.northwollo.tourism.entity.HotelBooking;
import com.northwollo.tourism.entity.User;
import com.northwollo.tourism.repository.BookingStatusRepository;
import com.northwollo.tourism.repository.HotelBookingRepository;
import com.northwollo.tourism.repository.HotelRepository;
import com.northwollo.tourism.repository.UserRepository;
import com.northwollo.tourism.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final HotelBookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final BookingStatusRepository statusRepository;

    @Override
    public HotelBookingResponseDto createBooking(BookingRequestDto dto, Long userId) {

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BookingStatusEntity requestedStatus = statusRepository.findByName("REQUESTED")
                .orElseThrow(() -> new RuntimeException("Booking status REQUESTED not found"));

        // Build the booking with numberOfGuests included
        HotelBooking booking = HotelBooking.builder()
                .hotel(hotel)
                .user(user)
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .numberOfGuests(dto.getNumberOfGuests())  // ← FIX: set number of guests
                .status(requestedStatus)
                .build();

        bookingRepository.save(booking);
        return mapToDto(booking);
    }


    @Override
    public List<HotelBookingResponseDto> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream().map(this::mapToDto).toList();
    }

    @Override
    public HotelBookingResponseDto proposeCost(Long bookingId, BigDecimal cost) {
        HotelBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.canProposeCost()) {
            throw new RuntimeException("Cost already proposed or booking invalid");
        }

        BookingStatusEntity costProposedStatus = statusRepository.findByName("COST_PROPOSED")
                .orElseThrow(() -> new RuntimeException("Booking status COST_PROPOSED not found"));

        booking.setTotalCost(cost);
        booking.setStatus(costProposedStatus);

        return mapToDto(bookingRepository.save(booking));
    }

    @Override
    public HotelBookingResponseDto uploadReceipt(Long bookingId, String receiptUrl, Long userId) {
        HotelBooking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized booking access"));

        if (!booking.canUploadReceipt()) {
            throw new RuntimeException("Payment not allowed yet");
        }

        BookingStatusEntity paidStatus = statusRepository.findByName("PAID")
                .orElseThrow(() -> new RuntimeException("Booking status PAID not found"));

        booking.setReceiptImageUrl(receiptUrl);
        booking.setStatus(paidStatus);

        return mapToDto(bookingRepository.save(booking));
    }

    @Override
    public HotelBookingResponseDto approveBooking(Long bookingId) {
        HotelBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.canApprove()) {
            throw new RuntimeException("Booking not paid");
        }

        BookingStatusEntity approvedStatus = statusRepository.findByName("APPROVED")
                .orElseThrow(() -> new RuntimeException("Booking status APPROVED not found"));

        booking.setStatus(approvedStatus);
        return mapToDto(bookingRepository.save(booking));
    }

    @Override
    public HotelBookingResponseDto rejectBooking(Long bookingId, String reason) {
        HotelBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingStatusEntity rejectedStatus = statusRepository.findByName("REJECTED")
                .orElseThrow(() -> new RuntimeException("Booking status REJECTED not found"));

        booking.setStatus(rejectedStatus);
        return mapToDto(bookingRepository.save(booking));
    }
    private HotelBookingResponseDto mapToDto(HotelBooking booking) {
        return HotelBookingResponseDto.builder()
                .bookingId(booking.getId())
                .hotel(HotelBookingResponseDto.HotelDto.builder()   // nested hotel
                        .id(booking.getHotel().getId())
                        .name(booking.getHotel().getName())
                        .build())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfGuests(booking.getNumberOfGuests())
                .bookingStatus(booking.getStatus().getName())
                .totalCost(booking.getTotalCost())
                .receiptImageUrl(booking.getReceiptImageUrl())
                .build();
    }

}
