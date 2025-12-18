package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByTourismPlaceId(Long tourismPlaceId);
}
