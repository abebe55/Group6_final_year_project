package com.northwollo.tourism.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class HotelBookingResponseDto {

    private Long bookingId;

    // Nested hotel info
    private HotelDto hotel;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfGuests;

    private String bookingStatus;
    private BigDecimal totalCost;
    private String receiptImageUrl;

    @Data
    @Builder
    public static class HotelDto {
        private Long id;
        private String name;
    }
}
