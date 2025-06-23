import type React from "react"
// Tipo para usuarios demo
export interface DemoUser {
  id: string
  name: string
  email: string
  phone: string
  qrCode: string
  balance: number
  avatar?: string
  registrationDate: string
  totalPurchases: number
  lastActivity: string
}

// Tipo para items del pedido con precios
export interface OrderItem {
  id: string
  productId: string
  productName: string
  size: string
  quantity: number
  unitPrice: number
}

// Tipo para pedidos demo
export interface DemoOrder {
  id: string
  qrCode: string
  userId: string
  customerName: string
  customerEmail: string
  orderDate: string
  status: "pending" | "delivered" | "cancelled"
  items: OrderItem[]
}

// Tipo para métodos de pago
export type PaymentMethod = "card" | "cash" 

// Update the Sale interface to include payment method and validation
export interface Sale {
  id: string
  email: string
  items: { productId: string; productName: string; quantity: number }[]
  saleDate: string
  saleType: "POS" | "Online"
  status: "Pending" | "Delivered" | "Returned"
  standId?: string
  deliveryQrValue?: string
  deliveredByStandId?: string
  deliveryTimestamp?: string
  paymentMethod?: PaymentMethod
  paymentValidated?: boolean
  totalAmount?: number
  returnRequested?: boolean
  returnReason?: string
  returnTimestamp?: string
  refundAmount?: number
}

// Update the NewProductData interface to support multiple images
export interface NewProductData {
  name: string
  category: string | null
  image_urls: string[] | null // Changed from image_url to image_urls array
  variants: Array<{ size: string; quantity: number }>
  low_stock_threshold: number | null
}

// Update the Product interface to support multiple images
export interface Product {
  product_id: string
  name: string
  category: string | null
  image_urls: string[] | null // Changed from image_url to image_urls array
  low_stock_threshold: number | null
  created_at: string
  updated_at: string
  variants: ProductVariant[]
  total_quantity: number
}

export interface ProductVariant {
  variant_id: string
  size: string
  quantity: number
}

// Navigation item type for sidebar
export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Stand and StandStock types for the stands page
export interface StandStock {
  productId: string
  productName: string
  assignedQuantity: number
  deliveredQuantity: number
}

export interface Stand {
  id: string
  name: string
  location: string
  description?: string
  operatingHours?: string
  imageUrl?: string
  contactPerson?: string
  contactPhone?: string
  qrCodeValue: string
  stock: StandStock[]
}
