import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import type { PaymentMethod } from '@/lib/types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type Stand = Database['public']['Tables']['stands']['Row']
type User = Database['public']['Tables']['users']['Row']

export interface SaleWithDetails extends Order {
  items: (OrderItem & {
    product_variant: ProductVariant & {
      product: {
        id: string
        name: string
        images: Array<{
          id: string
          product_id: string
          image_url: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }>
      }
    }
  })[]
  stand: Stand | null
  delivered_by_stand: Stand | null
  user: User | null
}

export interface SalesFilters {
  email?: string
  productId?: string
  standId?: string
  saleType?: 'all' | 'POS' | 'Online'
  status?: 'all' | 'pending' | 'delivered' | 'cancelled' | 'returned'
  paymentMethod?: 'all' | PaymentMethod
  paymentValidated?: 'all' | 'validated' | 'pending'
  dateFrom?: string
  dateTo?: string
}

export interface SalesStats {
  totalSales: number
  totalProducts: number
  validatedSales: number
  pendingValidation: number
  returnedSales: number
  cashOrdersPending: number
  totalSalesCount: number
}

// Fetch all sales with details
export async function getSales(filters?: SalesFilters): Promise<SaleWithDetails[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product_variant:product_variants(
          *,
          product:products(
            id, 
            name,
            images:product_images(*)
          )
        )
      ),
      stand:stands!stand_id(*),
      delivered_by_stand:stands!delivered_by_stand_id(*),
      user:users(*)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters) {
    if (filters.email) {
      query = query.ilike('customer_email', `%${filters.email}%`)
    }
    
    if (filters.saleType && filters.saleType !== 'all') {
      query = query.eq('sale_type', filters.saleType)
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query = query.eq('payment_method', filters.paymentMethod)
    }
    
    if (filters.paymentValidated === 'validated') {
      query = query.eq('payment_validated', true)
    } else if (filters.paymentValidated === 'pending') {
      query = query.eq('payment_validated', false)
    }
    
    if (filters.standId && filters.standId !== 'all') {
      query = query.or(`stand_id.eq.${filters.standId},delivered_by_stand_id.eq.${filters.standId}`)
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('created_at', endDate.toISOString())
    }
  }

  const { data: sales, error } = await query

  if (error) {
    throw new Error(`Error fetching sales: ${error.message}`)
  }

  // Filter by product if specified
  if (filters?.productId && filters.productId !== 'all') {
    return sales.filter(sale => 
      sale.items.some((item: any) => item.product_variant.product.id === filters.productId)
    )
  }

  return sales
}

// Fetch single sale with details
export async function getSale(id: string): Promise<SaleWithDetails | null> {
  const { data: sale, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product_variant:product_variants(
          *,
          product:products(
            id, 
            name,
            images:product_images(*)
          )
        )
      ),
      stand:stands!stand_id(*),
      delivered_by_stand:stands!delivered_by_stand_id(*),
      user:users(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching sale: ${error.message}`)
  }

  return sale
}

// Update sale status to delivered
export async function markSaleAsDelivered(saleId: string, deliveredByStandId?: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_by_stand_id: deliveredByStandId,
      delivery_timestamp: new Date().toISOString(),
    })
    .eq('id', saleId)

  if (error) {
    throw new Error(`Error marking sale as delivered: ${error.message}`)
  }
}

// Validate payment for a sale
export async function validatePayment(saleId: string, paymentMethod?: PaymentMethod): Promise<void> {
  const updateData: any = {
    payment_validated: true,
  }

  if (paymentMethod) {
    updateData.payment_method = paymentMethod
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', saleId)

  if (error) {
    throw new Error(`Error validating payment: ${error.message}`)
  }
}

// Process return for a sale
export async function processReturn(saleId: string, reason: string): Promise<void> {
  // Get the sale to calculate refund amount
  const sale = await getSale(saleId)
  if (!sale) {
    throw new Error('Sale not found')
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'returned',
      return_requested: true,
      return_reason: reason,
      return_timestamp: new Date().toISOString(),
      refund_amount: sale.total_amount,
    })
    .eq('id', saleId)

  if (error) {
    throw new Error(`Error processing return: ${error.message}`)
  }

  // Restore stock for returned items
  for (const item of sale.items) {
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('quantity')
      .eq('id', item.product_variant_id)
      .single()

    if (fetchError) {
      console.error(`Error fetching variant ${item.product_variant_id}:`, fetchError)
      continue
    }

    const newQuantity = variant.quantity + item.quantity

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ quantity: newQuantity })
      .eq('id', item.product_variant_id)

    if (updateError) {
      console.error(`Error updating variant ${item.product_variant_id}:`, updateError)
      continue
    }

    // Log stock movement
    await supabase
      .from('stock_movements')
      .insert({
        product_variant_id: item.product_variant_id,
        movement_type: 'return',
        quantity: item.quantity,
        previous_quantity: variant.quantity,
        new_quantity: newQuantity,
        reason: `Return for order ${saleId}: ${reason}`,
      })
  }
}

// Cancel a sale
export async function cancelSale(saleId: string): Promise<void> {
  // Get the sale to restore stock
  const sale = await getSale(saleId)
  if (!sale) {
    throw new Error('Sale not found')
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      return_requested: true,
      return_reason: 'Venta cancelada por administrador',
      return_timestamp: new Date().toISOString(),
      refund_amount: sale.total_amount,
    })
    .eq('id', saleId)

  if (error) {
    throw new Error(`Error cancelling sale: ${error.message}`)
  }

  // Restore stock for cancelled items
  for (const item of sale.items) {
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('quantity')
      .eq('id', item.product_variant_id)
      .single()

    if (fetchError) {
      console.error(`Error fetching variant ${item.product_variant_id}:`, fetchError)
      continue
    }

    const newQuantity = variant.quantity + item.quantity

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ quantity: newQuantity })
      .eq('id', item.product_variant_id)

    if (updateError) {
      console.error(`Error updating variant ${item.product_variant_id}:`, updateError)
      continue
    }

    // Log stock movement
    await supabase
      .from('stock_movements')
      .insert({
        product_variant_id: item.product_variant_id,
        movement_type: 'cancellation',
        quantity: item.quantity,
        previous_quantity: variant.quantity,
        new_quantity: newQuantity,
        reason: `Cancellation for order ${saleId}`,
      })
  }
}

// Update sale items (for editing orders)
export async function updateSaleItems(saleId: string, updatedItems: Array<{
  product_variant_id: string
  quantity: number
  unit_price: number
}>): Promise<void> {
  // Get the original sale to calculate stock changes
  const originalSale = await getSale(saleId)
  if (!originalSale) {
    throw new Error('Sale not found')
  }

  // Calculate new total
  const newTotal = updatedItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  // Calculate stock changes
  const stockChanges: { [productVariantId: string]: number } = {}

  // Calculate what was removed or reduced
  originalSale.items.forEach((originalItem) => {
    const updatedItem = updatedItems.find((item) => item.product_variant_id === originalItem.product_variant_id)
    if (!updatedItem) {
      // Item was completely removed - restore full quantity
      stockChanges[originalItem.product_variant_id] = (stockChanges[originalItem.product_variant_id] || 0) + originalItem.quantity
    } else if (updatedItem.quantity < originalItem.quantity) {
      // Quantity was reduced - restore the difference
      const difference = originalItem.quantity - updatedItem.quantity
      stockChanges[originalItem.product_variant_id] = (stockChanges[originalItem.product_variant_id] || 0) + difference
    }
  })

  // Calculate what was added or increased
  updatedItems.forEach((updatedItem) => {
    const originalItem = originalSale.items.find((item) => item.product_variant_id === updatedItem.product_variant_id)
    if (!originalItem) {
      // New item was added - reduce stock
      stockChanges[updatedItem.product_variant_id] = (stockChanges[updatedItem.product_variant_id] || 0) - updatedItem.quantity
    } else if (updatedItem.quantity > originalItem.quantity) {
      // Quantity was increased - reduce stock by the difference
      const difference = updatedItem.quantity - originalItem.quantity
      stockChanges[updatedItem.product_variant_id] = (stockChanges[updatedItem.product_variant_id] || 0) - difference
    }
  })

  // Apply stock changes
  for (const [productVariantId, change] of Object.entries(stockChanges)) {
    if (change === 0) continue

    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('quantity')
      .eq('id', productVariantId)
      .single()

    if (fetchError) {
      console.error(`Error fetching variant ${productVariantId}:`, fetchError)
      continue
    }

    const newQuantity = Math.max(0, variant.quantity + change)

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ quantity: newQuantity })
      .eq('id', productVariantId)

    if (updateError) {
      console.error(`Error updating variant ${productVariantId}:`, updateError)
      continue
    }

    // Log stock movement
    await supabase
      .from('stock_movements')
      .insert({
        product_variant_id: productVariantId,
        movement_type: change > 0 ? 'restore' : 'reduce',
        quantity: Math.abs(change),
        previous_quantity: variant.quantity,
        new_quantity: newQuantity,
        reason: `Order edit for ${saleId}`,
      })
  }

  // Delete existing order items
  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', saleId)

  if (deleteError) {
    throw new Error(`Error deleting order items: ${deleteError.message}`)
  }

  // Insert new order items
  const items = updatedItems.map(item => ({
    order_id: saleId,
    product_variant_id: item.product_variant_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: insertError } = await supabase
    .from('order_items')
    .insert(items)

  if (insertError) {
    throw new Error(`Error inserting order items: ${insertError.message}`)
  }

  // Update order total
  const { error: updateOrderError } = await supabase
    .from('orders')
    .update({ total_amount: newTotal })
    .eq('id', saleId)

  if (updateOrderError) {
    throw new Error(`Error updating order total: ${updateOrderError.message}`)
  }
}

// Calculate sales statistics
export async function getSalesStats(): Promise<SalesStats> {
  const { data: sales, error } = await supabase
    .from('orders')
    .select('*')

  if (error) {
    throw new Error(`Error fetching sales for stats: ${error.message}`)
  }

  const totalSales = sales.reduce((sum, sale) => 
    sum + (sale.status !== 'returned' && sale.status !== 'cancelled' ? sale.total_amount : 0), 0
  )
  
  const validatedSales = sales.filter((sale) => 
    sale.payment_validated && sale.status !== 'returned' && sale.status !== 'cancelled'
  ).length
  
  const pendingValidation = sales.filter((sale) => 
    !sale.payment_validated && sale.status !== 'returned' && sale.status !== 'cancelled'
  ).length
  
  const returnedSales = sales.filter((sale) => 
    sale.status === 'returned' || sale.status === 'cancelled'
  ).length
  
  const cashOrdersPending = sales.filter((sale) => 
    sale.payment_method === 'Efectivo' && !sale.payment_validated
  ).length

  // Calculate total products sold
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      order:orders(status)
    `)

  if (itemsError) {
    throw new Error(`Error fetching order items for stats: ${itemsError.message}`)
  }

  const totalProducts = orderItems.reduce((sum, item) => 
    sum + (item?.order?.status !== 'returned' && item?.order?.status !== 'cancelled' ? item?.quantity : 0), 0
  )

  return {
    totalSales,
    totalProducts,
    validatedSales,
    pendingValidation,
    returnedSales,
    cashOrdersPending,
    totalSalesCount: sales.filter((sale) => sale.status !== 'returned' && sale.status !== 'cancelled').length,
  }
} 