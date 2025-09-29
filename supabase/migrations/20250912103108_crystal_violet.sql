/*
# Real Estate Platform Database Schema

1. New Tables
  - `properties` - Store all property listings with detailed information
  - `buyer_requests` - Store buyer requirements and preferences  
  - `site_visits` - Store scheduled site visit bookings
  - `users` - Store user registration data and profiles

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Add policies for public read access to properties

3. Features
  - Comprehensive property details with utilities and amenities
  - Buyer matching system with detailed requirements
  - Site visit scheduling with status tracking
  - User profiles with contact information
*/

-- Create users table for user profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  user_type text CHECK (user_type IN ('seller', 'buyer', 'both')) DEFAULT 'buyer',
  created_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  property_type text CHECK (property_type IN ('land', 'house', 'commercial', 'apartment', 'villa')) NOT NULL,
  location_district text NOT NULL,
  location_town text NOT NULL,
  location_village text,
  distance_from_main_road text,
  has_water boolean DEFAULT false,
  has_power boolean DEFAULT false,
  has_internet boolean DEFAULT false,
  size_acres decimal,
  size_sqft decimal,
  bedrooms integer,
  bathrooms integer,
  asking_price decimal NOT NULL,
  description text,
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text,
  status text CHECK (status IN ('pending', 'approved', 'sold', 'withdrawn')) DEFAULT 'pending',
  images text[], -- Array of image URLs
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create buyer_requests table
CREATE TABLE IF NOT EXISTS buyer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  property_type text CHECK (property_type IN ('land', 'house', 'commercial', 'apartment', 'villa')) NOT NULL,
  budget_min decimal NOT NULL,
  budget_max decimal NOT NULL,
  preferred_districts text[] NOT NULL,
  preferred_towns text[],
  requires_water boolean DEFAULT false,
  requires_power boolean DEFAULT false,
  requires_internet boolean DEFAULT false,
  min_bedrooms integer,
  min_bathrooms integer,
  min_size_acres decimal,
  min_size_sqft decimal,
  additional_requirements text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  status text CHECK (status IN ('active', 'matched', 'fulfilled', 'cancelled')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  visitor_name text NOT NULL,
  visitor_phone text NOT NULL,
  visitor_email text,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  message text,
  status text CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for properties
CREATE POLICY "Anyone can read approved properties"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Anyone can insert properties"
  ON properties FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for buyer_requests
CREATE POLICY "Users can read own requests"
  ON buyer_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert requests"
  ON buyer_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert buyer requests"
  ON buyer_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for site_visits
CREATE POLICY "Anyone can book site visits"
  ON site_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read site visits"
  ON site_visits FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location_district, location_town);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(asking_price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_budget ON buyer_requests(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(preferred_date);