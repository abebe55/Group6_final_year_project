package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.HorseService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;
public interface HorseServiceRepository extends JpaRepository<HorseService, Long> {

    Optional<HorseService> findByRoadInfoId(Long roadInfoId);

    boolean existsByRoadInfoId(Long roadInfoId); // add this line
    @Query("SELECT hs FROM HorseService hs WHERE hs.roadInfo.tourismPlace.id = :tourismPlaceId")
    List<HorseService> findByTourismPlaceId(Long tourismPlaceId);
}
