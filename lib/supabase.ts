import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'staff'
          qr_code: string | null
          balance: number
          total_purchases: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'staff'
          qr_code?: string | null
          balance?: number
          total_purchases?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'staff'
          qr_code?: string | null
          balance?: number
          total_purchases?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string | null
          description: string | null
          low_stock_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          description?: string | null
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          description?: string | null
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          quantity?: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      stands: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          operating_hours: string | null
          image_url: string | null
          contact_person: string | null
          contact_phone: string | null
          qr_code_value: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          operating_hours?: string | null
          image_url?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          qr_code_value?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          operating_hours?: string | null
          image_url?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          qr_code_value?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stand_stock: {
        Row: {
          id: string
          stand_id: string
          product_variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stand_id: string
          product_variant_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stand_id?: string
          product_variant_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string
          customer_email: string
          qr_code: string | null
          status: 'pending' | 'delivered' | 'cancelled' | 'returned'
          payment_method: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated: boolean
          total_amount: number
          sale_type: 'POS' | 'Online'
          stand_id: string | null
          delivery_qr_value: string | null
          delivered_by_stand_id: string | null
          delivery_timestamp: string | null
          return_requested: boolean
          return_reason: string | null
          return_timestamp: string | null
          refund_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_name: string
          customer_email: string
          qr_code?: string | null
          status?: 'pending' | 'delivered' | 'cancelled' | 'returned'
          payment_method?: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated?: boolean
          total_amount: number
          sale_type?: 'POS' | 'Online'
          stand_id?: string | null
          delivery_qr_value?: string | null
          delivered_by_stand_id?: string | null
          delivery_timestamp?: string | null
          return_requested?: boolean
          return_reason?: string | null
          return_timestamp?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_name?: string
          customer_email?: string
          qr_code?: string | null
          status?: 'pending' | 'delivered' | 'cancelled' | 'returned'
          payment_method?: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated?: boolean
          total_amount?: number
          sale_type?: 'POS' | 'Online'
          stand_id?: string | null
          delivery_qr_value?: string | null
          delivered_by_stand_id?: string | null
          delivery_timestamp?: string | null
          return_requested?: boolean
          return_reason?: string | null
          return_timestamp?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_variant_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_variant_id: string
          stand_id: string | null
          movement_type: string
          quantity: number
          previous_quantity: number | null
          new_quantity: number | null
          reason: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_variant_id: string
          stand_id?: string | null
          movement_type: string
          quantity: number
          previous_quantity?: number | null
          new_quantity?: number | null
          reason?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_variant_id?: string
          stand_id?: string | null
          movement_type?: string
          quantity?: number
          previous_quantity?: number | null
          new_quantity?: number | null
          reason?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 