package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "horse_services")
public class HorseService extends BaseEntity {

    @NotNull
    @OneToOne
    @JoinColumn(name = "road_info_id")
    private RoadInfo roadInfo;

    @NotBlank
    private String ownerName;

    @NotBlank
    private String contactInfo;

    @Positive
    private double cost;
}
