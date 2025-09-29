import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Neon Database Configuration with better error handling
const connectionString = import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_VmvHUYSri63h@ep-noisy-credit-adnm56eq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Neon connection string:', connectionString ? 'Connected' : 'Missing');

const sql = neon(connectionString);

// Test database connection
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Check if tables exist
export const checkTables = async () => {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Existing tables:', result);
    return result;
  } catch (error) {
    console.error('Error checking tables:', error);
    return [];
  }
};

// Update existing tables with missing columns
export const updateTableSchema = async () => {
  try {
    console.log('Checking and updating table schemas...');
    
    // Add missing columns to buyer_requests table if they don't exist
    try {
      await sql`
        ALTER TABLE buyer_requests 
        ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high'))
      `;
      console.log('Added urgency column to buyer_requests');
    } catch (err) {
      console.log('urgency column may already exist');
    }

    try {
      await sql`
        ALTER TABLE buyer_requests 
        ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'whatsapp'))
      `;
      console.log('Added preferred_contact_method column to buyer_requests');
    } catch (err) {
      console.log('preferred_contact_method column may already exist');
    }

    try {
      await sql`
        ALTER TABLE buyer_requests 
        ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT '3-6months' CHECK (timeline IN ('immediate', '1-3months', '3-6months', '6-12months'))
      `;
      console.log('Added timeline column to buyer_requests');
    } catch (err) {
      console.log('timeline column may already exist');
    }

    console.log('Table schema update completed');
    return true;
  } catch (error) {
    console.error('Error updating table schema:', error);
    return false;
  }
};

// Create tables if they don't exist
export const createTables = async () => {
  try {
    console.log('Creating user_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'buyer' CHECK (role IN ('super_admin', 'admin', 'seller', 'buyer')),
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('Creating properties table...');
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        property_type TEXT NOT NULL CHECK (property_type IN ('land', 'house', 'commercial', 'apartment', 'villa')),
        location_district TEXT NOT NULL,
        location_town TEXT NOT NULL,
        location_village TEXT,
        distance_from_main_road TEXT,
        has_water BOOLEAN DEFAULT false,
        has_power BOOLEAN DEFAULT false,
        has_internet BOOLEAN DEFAULT false,
        size_acres NUMERIC,
        size_sqft NUMERIC,
        bedrooms INTEGER,
        bathrooms INTEGER,
        asking_price NUMERIC NOT NULL,
        description TEXT,
        owner_name TEXT NOT NULL,
        owner_phone TEXT NOT NULL,
        owner_email TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sold', 'withdrawn')),
        submitted_by UUID,
        approved_by UUID,
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('Creating buyer_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS buyer_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        property_type TEXT NOT NULL CHECK (property_type IN ('land', 'house', 'commercial', 'apartment', 'villa')),
        budget_min NUMERIC NOT NULL,
        budget_max NUMERIC NOT NULL,
        preferred_districts TEXT[] NOT NULL,
        preferred_towns TEXT,
        requires_water BOOLEAN DEFAULT false,
        requires_power BOOLEAN DEFAULT false,
        requires_internet BOOLEAN DEFAULT false,
        min_bedrooms INTEGER,
        min_bathrooms INTEGER,
        min_size_acres NUMERIC,
        min_size_sqft NUMERIC,
        additional_requirements TEXT,
        contact_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT,
        urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
        preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'whatsapp')),
        timeline TEXT DEFAULT '3-6months' CHECK (timeline IN ('immediate', '1-3months', '3-6months', '6-12months')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'fulfilled', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('Creating email_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        email_type TEXT NOT NULL CHECK (email_type IN ('buyer_request', 'property_submission', 'admin_notification', 'marketing')),
        status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        related_id UUID,
        content TEXT
      )
    `;

    console.log('Creating site_visits table...');
    await sql`
      CREATE TABLE IF NOT EXISTS site_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID,
        visitor_name TEXT NOT NULL,
        visitor_phone TEXT NOT NULL,
        visitor_email TEXT,
        preferred_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('Creating property_images table...');
    await sql`
      CREATE TABLE IF NOT EXISTS property_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL,
        image_url TEXT NOT NULL,
        image_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `;

    console.log('Creating demo admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO user_profiles (email, full_name, role, password_hash, is_active)
      VALUES ('admin@dykeinvestments.com', 'Super Admin', 'super_admin', ${hashedPassword}, true)
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('Tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
};

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
  preferred_towns?: string;
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
  urgency: 'low' | 'medium' | 'high';
  preferred_contact_method: 'phone' | 'email' | 'whatsapp';
  timeline: 'immediate' | '1-3months' | '3-6months' | '6-12months';
  status: 'active' | 'matched' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
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

// Database helper functions for Neon
export const neonDb = {
  // Authentication functions
  async signUp(email: string, password: string, fullName: string, role: string = 'buyer') {
    try {
      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM user_profiles WHERE email = ${email}
      `;
      
      if (existingUsers.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user profile
      const result = await sql`
        INSERT INTO user_profiles (id, email, full_name, role, password_hash, is_active)
        VALUES (${userId}, ${email}, ${fullName}, ${role}, ${hashedPassword}, true)
        RETURNING id, email, full_name, role
      `;

      return {
        user: {
          id: result[0].id,
          email: result[0].email
        },
        profile: result[0]
      };
    } catch (error: any) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  },

  async signIn(email: string, password: string) {
    try {
      const users = await sql`
        SELECT id, email, password_hash, full_name, role, is_active
        FROM user_profiles 
        WHERE email = ${email} AND is_active = true
      `;

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      return {
        user: {
          id: user.id,
          email: user.email
        },
        profile: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active
        }
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  async getUserProfile(userId: string) {
    return await sql`
      SELECT * FROM user_profiles WHERE id = ${userId}
    `;
  },

  // Properties
  async getProperties(filters: any = {}) {
    try {
      console.log('Getting properties with filters:', filters);
      
      // Get all approved properties first, then filter in JavaScript
      let properties = await sql`SELECT * FROM properties WHERE status = 'approved' ORDER BY created_at DESC`;
      
      // Apply filters
      if (filters.property_type) {
        properties = properties.filter((p: any) => p.property_type === filters.property_type);
      }

      if (filters.district) {
        properties = properties.filter((p: any) => p.location_district === filters.district);
      }

      if (filters.min_price) {
        const minPrice = parseFloat(filters.min_price);
        properties = properties.filter((p: any) => parseFloat(p.asking_price) >= minPrice);
      }

      if (filters.max_price) {
        const maxPrice = parseFloat(filters.max_price);
        properties = properties.filter((p: any) => parseFloat(p.asking_price) <= maxPrice);
      }

      if (filters.has_water) {
        properties = properties.filter((p: any) => p.has_water === true);
      }

      if (filters.has_power) {
        properties = properties.filter((p: any) => p.has_power === true);
      }

      if (filters.has_internet) {
        properties = properties.filter((p: any) => p.has_internet === true);
      }

      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        properties = properties.filter((p: any) => 
          p.title?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.location_district?.toLowerCase().includes(searchLower) ||
          p.location_town?.toLowerCase().includes(searchLower)
        );
      }
      
      console.log('Properties found after filtering:', properties.length);
      
      // Fetch images for each property
      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          const images = await this.getPropertyImages(property.id);
          return {
            ...property,
            property_images: images
          };
        })
      );
      
      return propertiesWithImages;
    } catch (error) {
      console.error('Error in getProperties:', error);
      throw error;
    }
  },

  // Get single property by ID
  async getPropertyById(id: string) {
    try {
      const result = await sql`SELECT * FROM properties WHERE id = ${id} AND status = 'approved'`;
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  },

  // Debug function to check all properties
  async getAllPropertiesDebug() {
    try {
      const result = await sql`SELECT id, title, status, location_district, asking_price, created_at FROM properties ORDER BY created_at DESC`;
      console.log('All properties in database:', result);
      return result;
    } catch (error) {
      console.error('Error fetching all properties:', error);
      throw error;
    }
  },

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating property:', property);
      
      const result = await sql`
        INSERT INTO properties (
          title, property_type, location_district, location_town, location_village,
          distance_from_main_road, has_water, has_power, has_internet,
          size_acres, size_sqft, bedrooms, bathrooms, asking_price,
          description, owner_name, owner_phone, owner_email, status, submitted_by
        ) VALUES (
          ${property.title}, 
          ${property.property_type}, 
          ${property.location_district},
          ${property.location_town}, 
          ${property.location_village || null}, 
          ${property.distance_from_main_road || null},
          ${property.has_water}, 
          ${property.has_power}, 
          ${property.has_internet},
          ${property.size_acres || null}, 
          ${property.size_sqft || null}, 
          ${property.bedrooms || null}, 
          ${property.bathrooms || null},
          ${property.asking_price}, 
          ${property.description || null}, 
          ${property.owner_name},
          ${property.owner_phone}, 
          ${property.owner_email || null}, 
          ${property.status}, 
          ${property.submitted_by || null}
        ) RETURNING *
      `;
      
      console.log('Property created successfully:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('Error creating property:', error);
      throw new Error(`Failed to create property: ${error.message}`);
    }
  },

  // Buyer Requests
  async createBuyerRequest(request: Omit<BuyerRequest, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating buyer request:', request);
      console.log('Preferred districts:', request.preferred_districts);
      
      const result = await sql`
        INSERT INTO buyer_requests (
          user_id, property_type, budget_min, budget_max, preferred_districts,
          preferred_towns, requires_water, requires_power, requires_internet,
          min_bedrooms, min_bathrooms, min_size_acres, min_size_sqft,
          additional_requirements, contact_name, contact_phone, contact_email, 
          urgency, preferred_contact_method, timeline, status
        ) VALUES (
          ${request.user_id || null}, 
          ${request.property_type}, 
          ${request.budget_min}, 
          ${request.budget_max},
          ${request.preferred_districts}, 
          ${request.preferred_towns || null},
          ${request.requires_water}, 
          ${request.requires_power}, 
          ${request.requires_internet},
          ${request.min_bedrooms || null}, 
          ${request.min_bathrooms || null}, 
          ${request.min_size_acres || null},
          ${request.min_size_sqft || null}, 
          ${request.additional_requirements || null}, 
          ${request.contact_name},
          ${request.contact_phone}, 
          ${request.contact_email || null}, 
          ${request.urgency}, 
          ${request.preferred_contact_method}, 
          ${request.timeline}, 
          ${request.status}
        ) RETURNING *
      `;
      
      console.log('Buyer request created successfully:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('Error creating buyer request:', error);
      throw new Error(`Failed to create buyer request: ${error.message}`);
    }
  },

  // Site Visits
  async createSiteVisit(visit: Omit<SiteVisit, 'id' | 'created_at'>) {
    try {
      const result = await sql`
        INSERT INTO site_visits (
          property_id, visitor_name, visitor_phone, visitor_email,
          preferred_date, preferred_time, message, status
        ) VALUES (
          ${visit.property_id}, ${visit.visitor_name}, ${visit.visitor_phone},
          ${visit.visitor_email || null}, ${visit.preferred_date}, ${visit.preferred_time},
          ${visit.message || null}, ${visit.status}
        ) RETURNING *
      `;
      
      return result[0];
    } catch (error: any) {
      console.error('Error creating site visit:', error);
      throw new Error(`Failed to create site visit: ${error.message}`);
    }
  },

  // Admin functions
  async getAllProperties() {
    try {
      return await sql`SELECT * FROM properties ORDER BY created_at DESC`;
    } catch (error) {
      console.error('Error fetching all properties:', error);
      throw error;
    }
  },

  async getAllBuyerRequests() {
    try {
      return await sql`SELECT * FROM buyer_requests ORDER BY created_at DESC`;
    } catch (error) {
      console.error('Error fetching buyer requests:', error);
      throw error;
    }
  },

  async getAllSiteVisits() {
    try {
      return await sql`
        SELECT sv.*, p.title as property_title, p.location_district, p.location_town
        FROM site_visits sv
        LEFT JOIN properties p ON sv.property_id = p.id
        ORDER BY sv.created_at DESC
      `;
    } catch (error) {
      console.error('Error fetching site visits:', error);
      throw error;
    }
  },

  async updatePropertyStatus(id: string, status: string, approvedBy?: string) {
    try {
      if (status === 'approved') {
        const result = await sql`
          UPDATE properties 
          SET status = ${status}, approved_by = ${approvedBy}, approved_at = NOW() 
          WHERE id = ${id} 
          RETURNING *
        `;
        return result[0];
      } else {
        const result = await sql`
          UPDATE properties 
          SET status = ${status} 
          WHERE id = ${id} 
          RETURNING *
        `;
        return result[0];
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  },

  // Email functionality using the email service
  async sendBuyerRequestEmail(requestData: any) {
    try {
      const { emailService } = await import('./emailService');
      
      const result = await emailService.sendEmail({
        to: 'info@netivon.com',
        subject: `New Buyer Request - ${requestData.property_type} in ${requestData.preferred_districts.join(', ')}`,
        html: emailService.generateBuyerRequestNotification(requestData)
      });

      return result;
    } catch (error) {
      console.error('Error sending buyer request email:', error);
      throw new Error('Failed to send email notification');
    }
  },

  async sendPropertySubmissionEmail(propertyData: any) {
    try {
      const { emailService } = await import('./emailService');
      
      const result = await emailService.sendEmail({
        to: 'info@netivon.com',
        subject: `New Property Submission - ${propertyData.title}`,
        html: emailService.generatePropertySubmissionNotification(propertyData)
      });

      return result;
    } catch (error) {
      console.error('Error sending property submission email:', error);
      throw new Error('Failed to send email notification');
    }
  },

  async sendPropertyMatchEmail(buyerData: any, properties: any[]) {
    try {
      const { emailService } = await import('./emailService');
      
      if (!buyerData.contact_email) {
        throw new Error('Buyer email not available');
      }
      
      const result = await emailService.sendEmail({
        to: buyerData.contact_email,
        subject: `Property Matches Found - ${properties.length} Properties Match Your Criteria`,
        html: emailService.generatePropertyMatchEmail(buyerData, properties)
      });

      return result;
    } catch (error) {
      console.error('Error sending property match email:', error);
      throw new Error('Failed to send property match email');
    }
  },

  // Enhanced buyer request functions
  async getBuyerRequestById(id: string) {
    const result = await sql`SELECT * FROM buyer_requests WHERE id = ${id}`;
    return result[0];
  },

  async updateBuyerRequestStatus(id: string, status: string) {
    const result = await sql`
      UPDATE buyer_requests 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    `;
    return result[0];
  },

  async matchPropertiesForBuyerRequest(requestId: string) {
    const request = await this.getBuyerRequestById(requestId);
    if (!request) return [];

    // Find matching properties based on buyer criteria
    const matchingProperties = await sql`
      SELECT * FROM properties 
      WHERE status = 'approved'
      AND property_type = ${request.property_type}
      AND asking_price BETWEEN ${request.budget_min} AND ${request.budget_max}
      AND location_district = ANY(${request.preferred_districts})
      ${request.requires_water ? sql`AND has_water = true` : sql``}
      ${request.requires_power ? sql`AND has_power = true` : sql``}
      ${request.requires_internet ? sql`AND has_internet = true` : sql``}
      ${request.min_bedrooms ? sql`AND bedrooms >= ${request.min_bedrooms}` : sql``}
      ${request.min_bathrooms ? sql`AND bathrooms >= ${request.min_bathrooms}` : sql``}
      ${request.min_size_acres ? sql`AND size_acres >= ${request.min_size_acres}` : sql``}
      ${request.min_size_sqft ? sql`AND size_sqft >= ${request.min_size_sqft}` : sql``}
      ORDER BY created_at DESC
    `;

    return matchingProperties;
  },

  // Analytics functions for admin dashboard
  async getBuyerRequestStats() {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'active') as active_requests,
        COUNT(*) FILTER (WHERE status = 'matched') as matched_requests,
        COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled_requests,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_requests
      FROM buyer_requests
    `;
    return stats[0];
  },

  async getPropertyStats() {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_properties,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_properties,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_properties,
        AVG(asking_price) as average_price,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_properties
      FROM properties
    `;
    return stats[0];
  },

  // Property Images functions
  async savePropertyImages(propertyId: string, base64Images: string[]) {
    try {
      console.log('Saving images for property:', propertyId);
      
      const imagePromises = base64Images.map(async (base64Image, index) => {
        return await sql`
          INSERT INTO property_images (
            property_id, image_url, image_order, is_primary
          ) VALUES (
            ${propertyId}, ${base64Image}, ${index}, ${index === 0}
          ) RETURNING *
        `;
      });

      const results = await Promise.all(imagePromises);
      console.log('Images saved successfully:', results.length);
      return results.map(result => result[0]);
    } catch (error: any) {
      console.error('Error saving property images:', error);
      throw new Error(`Failed to save property images: ${error.message}`);
    }
  },

  async getPropertyImages(propertyId: string) {
    try {
      const result = await sql`
        SELECT * FROM property_images 
        WHERE property_id = ${propertyId} 
        ORDER BY image_order ASC
      `;
      return result;
    } catch (error: any) {
      console.error('Error fetching property images:', error);
      // Return empty array if table doesn't exist, don't break the entire query
      if (error.message && error.message.includes('does not exist')) {
        console.warn('property_images table does not exist yet, returning empty array');
        return [];
      }
      throw error;
    }
  },

  async getPropertyWithImages(id: string) {
    try {
      const property = await this.getPropertyById(id);
      if (!property) return null;

      const images = await this.getPropertyImages(id);
      return {
        ...property,
        property_images: images
      };
    } catch (error) {
      console.error('Error fetching property with images:', error);
      throw error;
    }
  },

  // Site Visit Management
  async updateSiteVisitStatus(visitId: string, status: string) {
    try {
      const result = await sql`
        UPDATE site_visits 
        SET status = ${status}, updated_at = NOW() 
        WHERE id = ${visitId} 
        RETURNING *
      `;
      return result[0];
    } catch (error: any) {
      console.error('Error updating site visit status:', error);
      throw new Error(`Failed to update site visit status: ${error.message}`);
    }
  },

  // Property Management
  async deleteProperty(propertyId: string) {
    try {
      // Delete images first
      await sql`DELETE FROM property_images WHERE property_id = ${propertyId}`;
      
      // Delete property
      const result = await sql`
        DELETE FROM properties 
        WHERE id = ${propertyId} 
        RETURNING *
      `;
      return result[0];
    } catch (error: any) {
      console.error('Error deleting property:', error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  },

  async updateProperty(propertyId: string, updates: any) {
    try {
      const result = await sql`
        UPDATE properties 
        SET 
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description}, description),
          property_type = COALESCE(${updates.property_type}, property_type),
          asking_price = COALESCE(${updates.asking_price}, asking_price),
          updated_at = NOW()
        WHERE id = ${propertyId} 
        RETURNING *
      `;
      return result[0];
    } catch (error: any) {
      console.error('Error updating property:', error);
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }
};

export { sql };