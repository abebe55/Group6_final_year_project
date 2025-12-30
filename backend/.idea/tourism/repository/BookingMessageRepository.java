package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.BookingMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingMessageRepository extends JpaRepository<BookingMessage, Long> {

    @Query("""
           SELECT m
           FROM BookingMessage m
           WHERE m.booking.id = :bookingId
           ORDER BY m.createdAt ASC
           """)
    List<BookingMessage> findByBookingId(@Param("bookingId") Long bookingId);
}
