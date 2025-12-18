package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@NoArgsConstructor
public class Hotel extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "tourism_place_id")
    private TourismPlace tourismPlace;

    @NotBlank
    private String name;

    @Min(1)
    @Max(5)
    private int starRating;

    @NotBlank
    private String contactInfo;

    @Column(columnDefinition = "TEXT")
    private String bookingSteps;

    @Column(columnDefinition = "TEXT")
    private String policies;
}
