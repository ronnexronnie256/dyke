@@ .. @@
   phone TEXT,
   role user_role DEFAULT 'buyer',
   is_active BOOLEAN DEFAULT true,
+  password_hash TEXT NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );

@@ .. @@
 -- Insert demo admin user
-INSERT INTO user_profiles (id, email, full_name, role, is_active) VALUES 
-('00000000-0000-0000-0000-000000000001', 'admin@dykeinvestments.com', 'Super Admin', 'super_admin', true);
+-- Note: Password is 'admin123' hashed with bcrypt
+INSERT INTO user_profiles (id, email, full_name, role, is_active, password_hash) VALUES 
+('00000000-0000-0000-0000-000000000001', 'admin@dykeinvestments.com', 'Super Admin', 'super_admin', true, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');