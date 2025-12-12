// Database types - will be generated from Supabase schema
// For now, define manually based on our schema

export type Database = {
  public: {
    Tables: {
      crops: {
        Row: {
          id: string
          name: string
          display_name: string
          category: string
          base_temp: number
          gdd_to_maturity: number
          gdd_to_peak: number | null
          gdd_window: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['crops']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['crops']['Insert']>
      }
      cultivars: {
        Row: {
          id: string
          crop_id: string
          name: string
          display_name: string
          brix_base: number
          timing_class: 'early' | 'mid' | 'late'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cultivars']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cultivars']['Insert']>
      }
      rootstocks: {
        Row: {
          id: string
          crop_id: string
          name: string
          display_name: string
          brix_modifier: number
          vigor: 'dwarf' | 'semi-dwarf' | 'standard'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rootstocks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['rootstocks']['Insert']>
      }
      growing_regions: {
        Row: {
          id: string
          name: string
          display_name: string
          state: string
          latitude: number
          longitude: number
          usda_zone: string
          viable_crops: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['growing_regions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['growing_regions']['Insert']>
      }
      farms: {
        Row: {
          id: string
          name: string
          region_id: string
          contact_email: string | null
          contact_phone: string | null
          fulfillment_options: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['farms']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['farms']['Insert']>
      }
      farm_crops: {
        Row: {
          id: string
          farm_id: string
          cultivar_id: string
          rootstock_id: string | null
          tree_age_years: number | null
          acres: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['farm_crops']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['farm_crops']['Insert']>
      }
      farm_availability: {
        Row: {
          id: string
          farm_crop_id: string
          status: 'upcoming' | 'in_season' | 'at_peak' | 'ending_soon' | 'off_season'
          price_per_unit: number | null
          unit: string | null
          inventory_level: 'high' | 'medium' | 'low' | 'sold_out' | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['farm_availability']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['farm_availability']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience types
export type Crop = Database['public']['Tables']['crops']['Row']
export type Cultivar = Database['public']['Tables']['cultivars']['Row']
export type Rootstock = Database['public']['Tables']['rootstocks']['Row']
export type GrowingRegion = Database['public']['Tables']['growing_regions']['Row']
export type Farm = Database['public']['Tables']['farms']['Row']
export type FarmCrop = Database['public']['Tables']['farm_crops']['Row']
export type FarmAvailability = Database['public']['Tables']['farm_availability']['Row']
