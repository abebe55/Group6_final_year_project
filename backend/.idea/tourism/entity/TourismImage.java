package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tourism_images")
public class TourismImage extends BaseEntity {

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourism_place_id")
    private TourismPlace tourismPlace;
}
