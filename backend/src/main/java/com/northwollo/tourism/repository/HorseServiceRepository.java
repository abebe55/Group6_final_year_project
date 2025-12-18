package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.HorseService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HorseServiceRepository extends JpaRepository<HorseService, Long> {

    Optional<HorseService> findByRoadInfoId(Long roadInfoId);
}
