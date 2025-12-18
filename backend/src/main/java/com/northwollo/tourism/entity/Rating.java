package com.northwollo.tourism.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rating extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourism_place_id", nullable = false)
    private TourismPlace tourismPlace;

    @NotNull
    @Min(1)
    @Max(5)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
