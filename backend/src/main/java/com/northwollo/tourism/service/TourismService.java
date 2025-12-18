package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.TourismCreateDto;
import com.northwollo.tourism.dto.request.TourismUpdateDto;

public interface TourismService {

    Long create(TourismCreateDto dto);

    void update(Long id, TourismUpdateDto dto);

    void delete(Long id);

    void block(Long id);

    void unblock(Long id);
}
