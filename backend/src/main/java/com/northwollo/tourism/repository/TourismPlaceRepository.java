package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.TourismPlace;
import com.northwollo.tourism.enums.PlaceStatus;
import com.northwollo.tourism.enums.TourismCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourismPlaceRepository extends JpaRepository<TourismPlace, Long> {

    Page<TourismPlace> findByStatus(PlaceStatus status, Pageable pageable);

    Page<TourismPlace> findByCategory(TourismCategory category, Pageable pageable);

    Page<TourismPlace> findByCategoryAndStatus(
            TourismCategory category,
            PlaceStatus status,
            Pageable pageable
    );
}
