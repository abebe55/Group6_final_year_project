package com.northwollo.tourism.publicsearch.dto;

import com.northwollo.tourism.enums.TourismCategory;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class PublicTourismSearchRequestDto {

    private Set<TourismCategory> categories;
    private String keyword;
    private String kebele;
    private String wereda;
}
