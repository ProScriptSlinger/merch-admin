import { supabase } from "@/lib/supabase"
import type { Stand, StandStock } from "@/lib/types"

export interface StandWithStock {
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
  stock: StandStock[]
}

export interface CreateStandData {
  name: string
  location: string
  description?: string
  operating_hours?: string
  image_url?: string
  contact_person?: string
  contact_phone?: string
  qr_code_value?: string
}

export interface UpdateStandData extends Partial<CreateStandData> {
  id: string
}

export interface StandStockAssignment {
  stand_id: string
  product_variant_id: string
  quantity: number
}

// Get all stands with their stock information
export async function getStands(): Promise<Stand[]> {
  try {
    const { data, error } = await supabase
      .from('stands')
      .select(`
        *,
        stand_stock (
          quantity,
          product_variants (
            id,
            size,
            products (
              id,
              name
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching stands:', error)
      throw error
    }

    // Transform the data to match the Stand interface
    const transformedStands: Stand[] = (data || []).map((stand: any) => ({
      id: stand.id,
      name: stand.name,
      location: stand.location || '',
      description: stand.description,
      operatingHours: stand.operating_hours,
      imageUrl: stand.image_url,
      contactPerson: stand.contact_person,
      contactPhone: stand.contact_phone,
      qrCodeValue: stand.qr_code_value || '',
      stock: (stand.stand_stock || []).map((stock: any) => ({
        productId: stock.product_variants?.id || '',
        productName: stock.product_variants?.products?.name || '',
        assignedQuantity: stock.quantity || 0,
        deliveredQuantity: 0 // This would need to be calculated from orders
      }))
    }))

    return transformedStands
  } catch (error) {
    console.error('Error in getStands:', error)
    throw error
  }
}

// Get a single stand by ID
export async function getStandById(id: string): Promise<Stand | null> {
  try {
    const { data, error } = await supabase
      .from('stands')
      .select(`
        *,
        stand_stock (
          quantity,
          product_variants (
            id,
            size,
            products (
              id,
              name
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching stand:', error)
      throw error
    }

    if (!data) return null

    // Transform the data to match the Stand interface
    const transformedStand: Stand = {
      id: data.id,
      name: data.name,
      location: data.location || '',
      description: data.description,
      operatingHours: data.operating_hours,
      imageUrl: data.image_url,
      contactPerson: data.contact_person,
      contactPhone: data.contact_phone,
      qrCodeValue: data.qr_code_value || '',
      stock: (data.stand_stock || []).map((stock: any) => ({
        productId: stock.product_variants?.products?.id || '',
        productName: stock.product_variants?.products?.name || '',
        assignedQuantity: stock.quantity || 0,
        deliveredQuantity: 0
      }))
    }

    return transformedStand
  } catch (error) {
    console.error('Error in getStandById:', error)
    throw error
  }
}

// Create a new stand
export async function createStand(standData: CreateStandData): Promise<Stand> {
  try {
    const { data, error } = await supabase
      .from('stands')
      .insert({
        name: standData.name,
        location: standData.location,
        description: standData.description,
        operating_hours: standData.operating_hours,
        image_url: standData.image_url,
        contact_person: standData.contact_person,
        contact_phone: standData.contact_phone,
        qr_code_value: standData.qr_code_value
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating stand:', error)
      throw error
    }

    // Transform the response to match the Stand interface
    const transformedStand: Stand = {
      id: data.id,
      name: data.name,
      location: data.location || '',
      description: data.description,
      operatingHours: data.operating_hours,
      imageUrl: data.image_url,
      contactPerson: data.contact_person,
      contactPhone: data.contact_phone,
      qrCodeValue: data.qr_code_value || '',
      stock: []
    }

    return transformedStand
  } catch (error) {
    console.error('Error in createStand:', error)
    throw error
  }
}

// Update an existing stand
export async function updateStand(standData: UpdateStandData): Promise<Stand> {
  try {
    const { data, error } = await supabase
      .from('stands')
      .update({
        name: standData.name,
        location: standData.location,
        description: standData.description,
        operating_hours: standData.operating_hours,
        image_url: standData.image_url,
        contact_person: standData.contact_person,
        contact_phone: standData.contact_phone,
        qr_code_value: standData.qr_code_value
      })
      .eq('id', standData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating stand:', error)
      throw error
    }

    // Transform the response to match the Stand interface
    const transformedStand: Stand = {
      id: data.id,
      name: data.name,
      location: data.location || '',
      description: data.description,
      operatingHours: data.operating_hours,
      imageUrl: data.image_url,
      contactPerson: data.contact_person,
      contactPhone: data.contact_phone,
      qrCodeValue: data.qr_code_value || '',
      stock: []
    }

    return transformedStand
  } catch (error) {
    console.error('Error in updateStand:', error)
    throw error
  }
}

// Delete a stand (soft delete by setting is_active to false)
export async function deleteStand(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('stands')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting stand:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteStand:', error)
    throw error
  }
}

// Assign stock to a stand
export async function assignStockToStand(assignments: StandStockAssignment[]): Promise<void> {
  try {
    // First, delete existing assignments for the stand
    if (assignments.length > 0) {
      const standId = assignments[0].stand_id
      await supabase
        .from('stand_stock')
        .delete()
        .eq('stand_id', standId)
    }

    // Then insert new assignments
    if (assignments.length > 0) {
      const { error } = await supabase
        .from('stand_stock')
        .insert(assignments)

      if (error) {
        console.error('Error assigning stock to stand:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Error in assignStockToStand:', error)
    throw error
  }
}

// Get all product variants for stock assignment
export async function getProductVariantsForAssignment(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        size,
        quantity,
        price,
        products (
          id,
          name
        )
      `)
      .order('products(name)', { ascending: true })

    if (error) {
      console.error('Error fetching product variants:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getProductVariantsForAssignment:', error)
    throw error
  }
} 