package com.northwollo.tourism.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequestDto {

    @NotNull
    private Long tourismPlaceId;

    @Min(1)
    @Max(5)
    private int rating;

    private String comment;
}
