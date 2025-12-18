package com.northwollo.tourism.service.impl;

import com.northwollo.tourism.entity.Role;
import com.northwollo.tourism.entity.User;
import com.northwollo.tourism.repository.RoleRepository;
import com.northwollo.tourism.repository.UserRepository;
import com.northwollo.tourism.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public void activateUser(Long userId) {
        User user = getUser(userId);
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    public void deactivateUser(Long userId) {
        User user = getUser(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public void grantRole(Long userId, String roleName) {
        User user = getUser(userId);
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Override
    public void revokeRole(Long userId, String roleName) {
        User user = getUser(userId);
        user.getRoles().removeIf(r -> r.getName().equals(roleName));
        userRepository.save(user);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
