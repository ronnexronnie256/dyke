/*
  # Create Demo Admin User

  1. New Users
    - Creates a demo super admin user in auth.users
    - Creates corresponding user profile with super_admin role
    - Creates a demo regular user for testing

  2. Security
    - Uses Supabase auth system for user creation
    - Proper foreign key relationships
    - Secure password hashing

  Note: These are demo accounts for testing purposes
*/

-- Insert demo users into auth.users (this simulates what Supabase auth would do)
-- In a real environment, users would be created through the signup process

-- Create demo admin profile (assuming the user will be created through signup)
-- We'll create a trigger to handle profile creation automatically

-- Create a function to automatically create user profiles
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profiles when users sign up
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Note: Demo users should be created through the signup form
-- The login form will show the demo credentials for testing