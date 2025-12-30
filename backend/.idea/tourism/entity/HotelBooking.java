package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "hotel_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelBooking extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_ref")
    private User user;

    @FutureOrPresent
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkIn;

    @Future
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOut;

    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "receipt_image_url", length = 500)
    private String receiptImageUrl;

    @ManyToOne(optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    private BookingStatusEntity status;

    /* ================= BUSINESS RULE HELPERS ================= */

    public boolean canProposeCost() {
        return "REQUESTED".equals(status.getName());
    }

    public boolean canUploadReceipt() {
        return "COST_PROPOSED".equals(status.getName());
    }

    public boolean canApprove() {
        return "PAID".equals(status.getName());
    }
}
