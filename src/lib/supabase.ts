import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export type UserRole = 'super_admin' | 'admin' | 'seller' | 'buyer';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  created_at: string;
};

export type Property = {
  id: string;
  title: string;
  property_type: 'land' | 'house' | 'commercial' | 'apartment' | 'villa';
  location_district: string;
  location_town: string;
  location_village?: string;
  distance_from_main_road?: string;
  has_water: boolean;
  has_power: boolean;
  has_internet: boolean;
  size_acres?: number;
  size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  asking_price: number;
  description?: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  status: 'pending' | 'approved' | 'sold' | 'withdrawn';
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  property_images?: PropertyImage[];
};

export type BuyerRequest = {
  id: string;
  user_id?: string;
  property_type: 'land' | 'house' | 'commercial' | 'apartment' | 'villa';
  budget_min: number;
  budget_max: number;
  preferred_districts: string[];
  preferred_towns?: string[];
  requires_water: boolean;
  requires_power: boolean;
  requires_internet: boolean;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_size_acres?: number;
  min_size_sqft?: number;
  additional_requirements?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  status: 'active' | 'matched' | 'fulfilled' | 'cancelled';
  created_at: string;
};

export type SiteVisit = {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
};