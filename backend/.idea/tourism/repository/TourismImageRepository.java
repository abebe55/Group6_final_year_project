package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.TourismImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourismImageRepository extends JpaRepository<TourismImage, Long> {

    List<TourismImage> findByTourismPlaceId(Long tourismPlaceId);
}
