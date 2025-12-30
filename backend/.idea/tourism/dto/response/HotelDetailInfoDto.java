package com.northwollo.tourism.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class HotelDetailInfoDto {
    private Long id;
    private String name;
    private String description;
    private Integer stars;
    private String contactInfo;
    private String policies;
    private List<String> images;
    private Double averageRating;
    private List<HotelRatingResponseDto> ratings;
}
