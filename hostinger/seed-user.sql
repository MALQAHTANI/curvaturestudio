-- Employee login for the dashboard.
-- Email: info@curvaturestudio.com   Password: curvaturestudio3889
-- Import this AFTER schema.sql (and data.sql) on your Hostinger MySQL database.

INSERT INTO users (id, email, password_hash)
VALUES ('2a5ee95d-8579-4539-8fdb-0f87f2873eba', 'info@curvaturestudio.com',
        '$2b$10$YE66RqOyP/wuwAlg4bZcp.Y5RhqzisivsvHvZaHCJLsCWX.OGyFdK')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

INSERT INTO user_roles (id, user_id, role)
SELECT '5f26a9a6-1c9a-4d3b-8f4a-9d1c6b2e77aa', id, 'employee' FROM users WHERE email = 'info@curvaturestudio.com'
ON DUPLICATE KEY UPDATE role = VALUES(role);
