package com.northwollo.tourism.service;

import com.northwollo.tourism.dto.request.HotelCreateDto;

public interface HotelService {

    Long create(HotelCreateDto dto);

    void delete(Long id);
}
