package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.HotelBooking;
import com.northwollo.tourism.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotelBookingRepository extends JpaRepository<HotelBooking, Long> {

    List<HotelBooking> findByUserId(Long userId);

    Optional<HotelBooking> findByIdAndUserId(Long id, Long userId);
}
