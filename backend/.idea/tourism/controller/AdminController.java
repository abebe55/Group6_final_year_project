package com.northwollo.tourism.controller;

import com.northwollo.tourism.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    // Activate user
    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    // Deactivate user
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Grant role
    @PostMapping("/users/{id}/roles/{role}")
    public ResponseEntity<Void> grantRole(
            @PathVariable Long id,
            @PathVariable String role) {
        userService.grantRole(id, role.toUpperCase());
        return ResponseEntity.ok().build();
    }

    // Revoke role
    @DeleteMapping("/users/{id}/roles/{role}")
    public ResponseEntity<Void> revokeRole(
            @PathVariable Long id,
            @PathVariable String role) {
        userService.revokeRole(id, role.toUpperCase());
        return ResponseEntity.ok().build();
    }
}
