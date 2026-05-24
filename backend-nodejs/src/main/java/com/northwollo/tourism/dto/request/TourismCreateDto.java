package com.northwollo.tourism.dto.request;

import com.northwollo.tourism.enums.TourismCategory;
import lombok.Data;

@Data
public class TourismCreateDto {
    private String name;
    private TourismCategory category;
    private String description;
    private String wereda;
    private String kebele;
    private String bestTime;
    private String peaceInfo;
    private String languages; // comma-separated string
    private String imageUrl;
    private String visitTime; // ISO-8601 duration
}
