package com.northwollo.tourism.service;

public interface UserService {

    void activateUser(Long userId);

    void deactivateUser(Long userId);

    void deleteUser(Long userId);

    void grantRole(Long userId, String roleName);

    void revokeRole(Long userId, String roleName);
}
