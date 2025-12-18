package com.northwollo.tourism.dto.request;

import com.northwollo.tourism.enums.TourismCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class TourismCreateDto {

    @NotBlank
    @Size(min = 3, max = 150)
    private String name;

    @NotNull
    private TourismCategory category;

    @NotBlank
    private String description;

    @NotBlank
    private String wereda;

    @NotBlank
    private String kebele;

    private String bestTime;

    private String peaceInfo;

    private String visitTime; // ISO-8601 duration, e.g., "PT4H"

    private List<String> languages;

    private String imageUrl; // optional

    // ===== Getters & Setters =====
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public TourismCategory getCategory() { return category; }
    public void setCategory(TourismCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getWereda() { return wereda; }
    public void setWereda(String wereda) { this.wereda = wereda; }

    public String getKebele() { return kebele; }
    public void setKebele(String kebele) { this.kebele = kebele; }

    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }

    public String getPeaceInfo() { return peaceInfo; }
    public void setPeaceInfo(String peaceInfo) { this.peaceInfo = peaceInfo; }

    public String getVisitTime() { return visitTime; }
    public void setVisitTime(String visitTime) { this.visitTime = visitTime; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
