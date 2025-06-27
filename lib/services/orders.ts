import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type Stand = Database['public']['Tables']['stands']['Row']
type User = Database['public']['Tables']['users']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

export interface OrderWithDetails extends Order {
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
  transaction?: Transaction[] | []
}

export interface CreateOrderData {
  user_id?: string | null
  customer_id?: string | null
  customer_email: string
  qr_code?: string | null
  payment_method?: "cash" | "card" 
  total_amount: number
  status?: 'waiting_payment' | 'pending' | 'delivered' | 'cancelled' | 'returned'
  stand_id?: string | null
  items: Array<{
    product_variant_id: string
    quantity: number
    unit_price: number
  }>
}

export interface UpdateOrderData {
  status?: 'pending' | 'delivered' | 'cancelled' | 'returned'
  payment_validated?: boolean
  delivery_qr_value?: string | null
  delivered_by_stand_id?: string | null
  delivery_timestamp?: string | null
  return_requested?: boolean
  return_reason?: string | null
  return_timestamp?: string | null
  refund_amount?: number | null
}

// Fetch all orders with details
export async function getOrders(): Promise<OrderWithDetails[]> {
  const { data: orders, error } = await supabase
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

  if (error) {
    throw new Error(`Error fetching orders: ${error.message}`)
  }

  return orders
}

// Fetch single order with details
export async function getOrder(id: string): Promise<OrderWithDetails | null> {
  const { data: order, error } = await supabase
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
    throw new Error(`Error fetching order: ${error.message}`)
  }

  return order
}

// Create new order
export async function createOrder(orderData: CreateOrderData): Promise<OrderWithDetails> {
  // Generate QR code if not provided
  const qrCode = orderData.qr_code || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      customer_id: orderData.customer_id,
      customer_email: orderData.customer_email,
      qr_code: qrCode,
      payment_method: orderData.payment_method,
      total_amount: orderData.total_amount,
      stand_id: orderData.stand_id,
      status: orderData.status || "waiting_payment",
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Error creating order: ${orderError.message}`)
  }

  // Create order items
  if (orderData.items.length > 0) {
    const items = orderData.items.map(item => ({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items)

    if (itemsError) {
      throw new Error(`Error creating order items: ${itemsError.message}`)
    }
  }

  return getOrder(order.id) as Promise<OrderWithDetails>
}

// Update order
export async function updateOrder(id: string, orderData: UpdateOrderData): Promise<OrderWithDetails> {
  const { error } = await supabase
    .from('orders')
    .update(orderData)
    .eq('id', id)
    

  if (error) {
    throw new Error(`Error updating order: ${error.message}`)
  }

  return getOrder(id) as Promise<OrderWithDetails>
}

// Delete order
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting order: ${error.message}`)
  }
}

// Get orders by user
export async function getOrdersByUser(userId: string): Promise<OrderWithDetails[]> {
  const { data: orders, error } = await supabase
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching user orders: ${error.message}`)
  }

  return orders
}

// Get orders by status
export async function getOrdersByStatus(status: Order['status']): Promise<OrderWithDetails[]> {
  const { data: orders, error } = await supabase
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
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching orders by status: ${error.message}`)
  }

  return orders
}

// Get order by QR code
export async function getOrderByQRCode(qrCode: string): Promise<any | null> {
  const { data: order, error } = await supabase
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
      transaction:transactions!transactions_order_id_fkey(*)
      stand:stands!stand_id(*),
      delivered_by_stand:stands!delivered_by_stand_id(*),
      user:users(*)
    `)
    .eq('qr_code', qrCode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching order by QR code: ${error.message}`)
  }

  return order
}