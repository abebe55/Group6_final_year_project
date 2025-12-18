package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "tourism_images")
public class TourismImage extends BaseEntity {

    @NotNull
    @ManyToOne
    @JoinColumn(name = "tourism_place_id")
    private TourismPlace tourismPlace;

    @NotBlank
    private String imageUrl;
}
