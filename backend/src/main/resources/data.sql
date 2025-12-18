-- ===============================
-- ROLES
-- ===============================
INSERT INTO roles (id, name, created_at, updated_at)
VALUES
    (1, 'ADMIN', NOW(), NOW()),
    (2, 'CLIENT', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

-- ===============================
-- USERS (ADMIN)
-- Password: admin123
-- BCrypt hash
-- ===============================
INSERT INTO users (id, username, password_hash, email, active, created_at, updated_at)
VALUES
    (
        1,
        'admin',
        '$2a$10$7bPqTnWZt1uD4N3R4pZkUuFzRz4X4hJtH9zjvK8kQ2U3F1lZzKx8W',
        'admin@northwollo.com',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

-- ===============================
-- USER ROLES (ADMIN -> ADMIN ROLE)
-- ===============================
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1)
    ON CONFLICT DO NOTHING;
