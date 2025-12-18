package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "hotel_images")
public class HotelImage extends BaseEntity {

    @NotNull
    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @NotBlank
    private String imageUrl;
}
