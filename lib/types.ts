import type { LucideIcon } from "lucide-react"

// Variante de producto (talla y cantidad)
export type ProductVariant = {
  variant_id?: string // Opcional, se generará en la BD
  product_id?: string // Opcional, se asignará al crear
  size: string // S, M, L, XL, XXL
  quantity: number
  // Podrías añadir campos como sku_variant, price_variant si fueran necesarios
}

export type Product = {
  product_id: string // UUID
  name: string
  category: string | null
  image_url: string | null
  variants: ProductVariant[] // Array de variantes de talla y stock
  total_quantity?: number // Calculado dinámicamente a partir de las variantes
  low_stock_threshold: number | null
  created_at: string // TIMESTAMPTZ
  updated_at: string // TIMESTAMPTZ
}

// Tipo para crear un nuevo producto
export type NewProductData = {
  name: string
  category: string | null
  image_url: string | null
  variants: Array<{ size: string; quantity: number }>
  low_stock_threshold: number | null
}

// Tipos existentes (Stand, Sale, etc. se mantienen igual por ahora)
export type StandStock = {
  productId: string
  productName: string
  assignedQuantity: number
  deliveredQuantity: number
}

export type Stand = {
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

export type DeliveryLog = {
  id: string
  saleId?: string
  standId: string
  productId?: string
  quantity?: number
  timestamp: string
  scannedQrData: string
}

export type SaleItem = {
  productId: string
  productName: string
  quantity: number
}

export type Sale = {
  id: string
  email: string
  items: SaleItem[]
  saleDate: string
  saleType: "POS" | "Online"
  status: "Pending" | "Delivered"
  standId?: string
  deliveryQrValue?: string
  deliveredByStandId?: string
  deliveryTimestamp?: string
}

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  label?: string
  variant?: "default" | "ghost"
  subItems?: NavItem[]
}
