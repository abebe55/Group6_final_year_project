package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByTourismPlaceId(Long tourismPlaceId);
}
