package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByTourismPlaceId(Long tourismPlaceId);

    // 🔹 Only for booking page to fetch hotel images eagerly
    @Query("SELECT h FROM Hotel h LEFT JOIN FETCH h.images WHERE h.id = :hotelId")
    Optional<Hotel> findByIdWithImages(@Param("hotelId") Long hotelId);

}
