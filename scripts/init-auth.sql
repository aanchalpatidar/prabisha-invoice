-- Initialize default roles
INSERT INTO Role (id, name, description, permissions, createdAt, updatedAt) VALUES
('role_admin', 'ADMIN', 'Administrator with full access', '["*"]', NOW(), NOW()),
('role_user', 'USER', 'Regular user with limited access', '["invoices:read", "invoices:create", "quotations:read", "quotations:create", "customers:read", "customers:create"]', NOW(), NOW()),
('role_viewer', 'VIEWER', 'View-only access', '["invoices:read", "quotations:read", "customers:read"]', NOW(), NOW());

-- Create a default admin user (password: admin123)
-- Note: This password should be changed after first login
INSERT INTO User (id, name, email, password, isActive, createdAt, updatedAt) VALUES
('user_admin', 'System Administrator', 'admin@prabisha.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', true, NOW(), NOW());

-- Assign admin role to the default user
UPDATE User SET roleId = 'role_admin' WHERE id = 'user_admin'; 