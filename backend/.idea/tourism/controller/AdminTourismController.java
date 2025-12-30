package com.northwollo.tourism.controller;

import com.northwollo.tourism.dto.request.TourismCreateDto;
import com.northwollo.tourism.dto.request.TourismUpdateDto;
import com.northwollo.tourism.service.TourismService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tourism")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTourismController {

    private final TourismService tourismService;

    @PostMapping
    public ResponseEntity<Long> create(@Valid @RequestBody TourismCreateDto dto) {
        return ResponseEntity.ok(tourismService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @Valid @RequestBody TourismUpdateDto dto) {
        tourismService.update(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tourismService.delete(id);
        return ResponseEntity.ok().build();
    }

}
