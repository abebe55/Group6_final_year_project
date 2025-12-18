package com.northwollo.tourism.entity;

import com.northwollo.tourism.enums.RoadType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "road_infos")
public class RoadInfo extends BaseEntity {

    @NotNull
    @ManyToOne
    @JoinColumn(name = "tourism_place_id")
    private TourismPlace tourismPlace;

    @NotNull
    @Enumerated(EnumType.STRING)
    private RoadType roadType;

    @Positive
    private double distanceKm;

    @Column(columnDefinition = "TEXT")
    private String description;
}
