// Mock data for demonstration
import type { Product, Stand, DeliveryLog, Sale } from "./types"

export const mockProducts: Product[] = [
  {
    product_id: "prod_1",
    name: "Campera de Cuero",
    category: "Outerwear",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_1_1",
        product_id: "prod_1",
        size: "S",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_2",
        product_id: "prod_1",
        size: "M",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_3",
        product_id: "prod_1",
        size: "L",
        quantity: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_4",
        product_id: "prod_1",
        size: "XL",
        quantity: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 72,
    low_stock_threshold: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_2",
    name: "Jeans Slim",
    category: "Pantalones",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_2_1",
        product_id: "prod_2",
        size: "38",
        quantity: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_2",
        product_id: "prod_2",
        size: "40",
        quantity: 22,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_3",
        product_id: "prod_2",
        size: "42",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_4",
        product_id: "prod_2",
        size: "44",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 80,
    low_stock_threshold: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_3",
    name: "Remera Básica",
    category: "Remeras",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_3_1",
        product_id: "prod_3",
        size: "S",
        quantity: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_3_2",
        product_id: "prod_3",
        size: "M",
        quantity: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_3_3",
        product_id: "prod_3",
        size: "L",
        quantity: 35,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_3_4",
        product_id: "prod_3",
        size: "XL",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 130,
    low_stock_threshold: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_4",
    name: "Zapatillas Deportivas",
    category: "Calzado",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_4_1",
        product_id: "prod_4",
        size: "39",
        quantity: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_4_2",
        product_id: "prod_4",
        size: "40",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_4_3",
        product_id: "prod_4",
        size: "41",
        quantity: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_4_4",
        product_id: "prod_4",
        size: "42",
        quantity: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_4_5",
        product_id: "prod_4",
        size: "43",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 80,
    low_stock_threshold: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_5",
    name: "Buzo con Capucha",
    category: "Buzos",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_5_1",
        product_id: "prod_5",
        size: "S",
        quantity: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_5_2",
        product_id: "prod_5",
        size: "M",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_5_3",
        product_id: "prod_5",
        size: "L",
        quantity: 22,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_5_4",
        product_id: "prod_5",
        size: "XL",
        quantity: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 85,
    low_stock_threshold: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_6",
    name: "Vestido Casual",
    category: "Vestidos",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_6_1",
        product_id: "prod_6",
        size: "XS",
        quantity: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_2",
        product_id: "prod_6",
        size: "S",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_3",
        product_id: "prod_6",
        size: "M",
        quantity: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_4",
        product_id: "prod_6",
        size: "L",
        quantity: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 55,
    low_stock_threshold: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockStands: Stand[] = [
  {
    id: "stand_A",
    name: "Main Entrance Stand",
    location: "Gate A",
    description: "Primary pickup point for all online orders and general information.",
    operatingHours: "9:00 AM - 8:00 PM",
    imageUrl: "/placeholder.svg?width=400&height=200",
    contactPerson: "Jane Doe",
    contactPhone: "123-456-7890",
    qrCodeValue: "STAND_QR_MAIN_ENTRANCE",
    stock: [
      { productId: "prod_1", productName: "Campera de Cuero", assignedQuantity: 30, deliveredQuantity: 5 },
      { productId: "prod_3", productName: "Remera Básica", assignedQuantity: 20, deliveredQuantity: 3 },
      { productId: "prod_4", productName: "Zapatillas Deportivas", assignedQuantity: 40, deliveredQuantity: 10 },
    ],
  },
  {
    id: "stand_B",
    name: "VIP Lounge Stand",
    location: "Section C, VIP Area",
    description: "Exclusive merch pickup for VIP ticket holders. Fast-track service available.",
    operatingHours: "11:00 AM - 10:00 PM",
    imageUrl: "/placeholder.svg?width=400&height=200",
    contactPerson: "John Smith",
    contactPhone: "098-765-4321",
    qrCodeValue: "STAND_QR_VIP_LOUNGE",
    stock: [
      { productId: "prod_1", productName: "Campera de Cuero", assignedQuantity: 25, deliveredQuantity: 8 },
      { productId: "prod_2", productName: "Jeans Slim", assignedQuantity: 20, deliveredQuantity: 5 },
      { productId: "prod_5", productName: "Buzo con Capucha", assignedQuantity: 15, deliveredQuantity: 2 },
      { productId: "prod_6", productName: "Vestido Casual", assignedQuantity: 12, deliveredQuantity: 3 },
    ],
  },
  {
    id: "stand_C",
    name: "Food Court Stand",
    location: "Central Food Area",
    description: "Convenient merch pickup while you grab food and drinks.",
    operatingHours: "10:00 AM - 9:00 PM",
    imageUrl: "/placeholder.svg?width=400&height=200",
    contactPerson: "Maria Garcia",
    contactPhone: "555-123-4567",
    qrCodeValue: "STAND_QR_FOOD_COURT",
    stock: [
      { productId: "prod_3", productName: "Remera Básica", assignedQuantity: 15, deliveredQuantity: 4 },
      { productId: "prod_4", productName: "Zapatillas Deportivas", assignedQuantity: 35, deliveredQuantity: 12 },
      { productId: "prod_5", productName: "Buzo con Capucha", assignedQuantity: 20, deliveredQuantity: 6 },
    ],
  },
]

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

// Usuarios demo
export const mockDemoUsers: DemoUser[] = [
  {
    id: "user_001",
    qrCode: "USER-QR-001",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+54 11 1234-5678",
    balance: 15000,
    avatar: "/placeholder-user.jpg",
    registrationDate: "2024-01-15T10:30:00Z",
    lastActivity: "2024-12-18T14:22:00Z",
    totalPurchases: 125000,
  },
  {
    id: "user_002",
    qrCode: "USER-QR-002",
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "+54 11 2345-6789",
    balance: 8500,
    avatar: "/placeholder-user.jpg",
    registrationDate: "2024-02-20T09:15:00Z",
    lastActivity: "2024-12-19T11:45:00Z",
    totalPurchases: 89000,
  },
  {
    id: "user_003",
    qrCode: "USER-QR-003",
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    phone: "+54 11 3456-7890",
    balance: 25000,
    avatar: "/placeholder-user.jpg",
    registrationDate: "2024-03-10T16:20:00Z",
    lastActivity: "2024-12-19T09:30:00Z",
    totalPurchases: 156000,
  },
  {
    id: "user_004",
    qrCode: "USER-QR-004",
    name: "Ana Martín",
    email: "ana.martin@email.com",
    phone: "+54 11 4567-8901",
    balance: 3200,
    avatar: "/placeholder-user.jpg",
    registrationDate: "2024-04-05T12:10:00Z",
    lastActivity: "2024-12-17T15:20:00Z",
    totalPurchases: 67000,
  },
]

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
  paymentMethod: string
  items: OrderItem[]
}

// Datos de pedidos demo
export const mockDemoOrders: DemoOrder[] = [
  {
    id: "ORDER-2024-001",
    qrCode: "ORDER-QR-001",
    userId: "user_001",
    customerName: "Juan Pérez",
    customerEmail: "juan.perez@email.com",
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    status: "pending",
    paymentMethod: "Efectivo",
    items: [
      {
        id: "item_1",
        productId: "prod_1",
        productName: "Campera de Cuero",
        size: "M",
        quantity: 1,
        unitPrice: 25000,
      },
      {
        id: "item_2",
        productId: "prod_2",
        productName: "Jeans Slim",
        size: "42",
        quantity: 1,
        unitPrice: 18000,
      },
    ],
  },
  {
    id: "ORDER-2024-002",
    qrCode: "ORDER-QR-002",
    userId: "user_002",
    customerName: "María García",
    customerEmail: "maria.garcia@email.com",
    orderDate: new Date(Date.now() - 172800000).toISOString(),
    status: "pending",
    paymentMethod: "Mercado Pago",
    items: [
      {
        id: "item_3",
        productId: "prod_3",
        productName: "Remera Básica",
        size: "L",
        quantity: 2,
        unitPrice: 8500,
      },
      {
        id: "item_4",
        productId: "prod_5",
        productName: "Buzo con Capucha",
        size: "M",
        quantity: 1,
        unitPrice: 15000,
      },
      {
        id: "item_5",
        productId: "prod_4",
        productName: "Zapatillas Deportivas",
        size: "40",
        quantity: 1,
        unitPrice: 32000,
      },
    ],
  },
  {
    id: "ORDER-2024-003",
    qrCode: "ORDER-QR-003",
    userId: "user_003",
    customerName: "Carlos López",
    customerEmail: "carlos.lopez@email.com",
    orderDate: new Date(Date.now() - 259200000).toISOString(),
    status: "pending",
    paymentMethod: "Efectivo",
    items: [
      {
        id: "item_6",
        productId: "prod_6",
        productName: "Vestido Casual",
        size: "M",
        quantity: 1,
        unitPrice: 22000,
      },
      {
        id: "item_7",
        productId: "prod_3",
        productName: "Remera Básica",
        size: "S",
        quantity: 3,
        unitPrice: 8500,
      },
    ],
  },
]

export const mockSales: Sale[] = [
  {
    id: "sale_1",
    email: "customer1@example.com",
    items: [{ productId: "prod_1", productName: "Campera de Cuero", quantity: 1 }],
    saleDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    saleType: "Online",
    status: "Pending",
    deliveryQrValue: "SALE_QR_ONLINE_1",
    paymentMethod: "QR_MercadoPago",
    paymentValidated: false,
    totalAmount: 25000,
  },
  {
    id: "sale_2",
    email: "customer2@example.com",
    items: [
      { productId: "prod_2", productName: "Jeans Slim", quantity: 1 },
      { productId: "prod_4", productName: "Zapatillas Deportivas", quantity: 2 },
    ],
    saleDate: new Date(Date.now() - 86400000).toISOString(),
    saleType: "Online",
    status: "Delivered",
    deliveryQrValue: "SALE_QR_ONLINE_2",
    deliveredByStandId: "stand_A",
    deliveryTimestamp: new Date(Date.now() - 3600000).toISOString(),
    paymentMethod: "Transferencia",
    paymentValidated: true,
    totalAmount: 82000,
  },
  {
    id: "sale_3",
    email: "pos_customer1@example.com",
    items: [{ productId: "prod_3", productName: "Remera Básica", quantity: 1 }],
    saleDate: new Date(Date.now() - 7200000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_B",
    deliveredByStandId: "stand_B",
    deliveryTimestamp: new Date(Date.now() - 7200000).toISOString(),
    paymentMethod: "Efectivo",
    paymentValidated: false,
    totalAmount: 8500,
  },
  {
    id: "sale_4",
    email: "customer3@example.com",
    items: [{ productId: "prod_1", productName: "Campera de Cuero", quantity: 2 }],
    saleDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    saleType: "Online",
    status: "Pending",
    deliveryQrValue: "SALE_QR_ONLINE_3",
    paymentMethod: "QR_MercadoPago",
    paymentValidated: false,
    totalAmount: 50000,
  },
  {
    id: "sale_5",
    email: "pos_customer2@example.com",
    items: [{ productId: "prod_4", productName: "Zapatillas Deportivas", quantity: 1 }],
    saleDate: new Date(Date.now() - 14400000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_A",
    deliveredByStandId: "stand_A",
    deliveryTimestamp: new Date(Date.now() - 14400000).toISOString(),
    paymentMethod: "POS",
    paymentValidated: true,
    totalAmount: 32000,
  },
  {
    id: "sale_6",
    email: "customer4@example.com",
    items: [
      { productId: "prod_3", productName: "Remera Básica", quantity: 2 },
      { productId: "prod_5", productName: "Buzo con Capucha", quantity: 1 },
    ],
    saleDate: new Date(Date.now() - 3600000).toISOString(),
    saleType: "Online",
    status: "Pending",
    deliveryQrValue: "SALE_QR_ONLINE_4",
    paymentMethod: "Efectivo",
    paymentValidated: false,
    totalAmount: 32000,
  },
  {
    id: "sale_7",
    email: "pos_customer3@example.com",
    items: [{ productId: "prod_6", productName: "Vestido Casual", quantity: 1 }],
    saleDate: new Date(Date.now() - 1800000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_C",
    deliveredByStandId: "stand_C",
    deliveryTimestamp: new Date(Date.now() - 1800000).toISOString(),
    paymentMethod: "POS",
    paymentValidated: true,
    totalAmount: 22000,
  },
  {
    id: "sale_8",
    email: "efectivo_customer@example.com",
    items: [{ productId: "prod_5", productName: "Buzo con Capucha", quantity: 1 }],
    saleDate: new Date(Date.now() - 900000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_A",
    deliveredByStandId: "stand_A",
    deliveryTimestamp: new Date(Date.now() - 900000).toISOString(),
    paymentMethod: "Efectivo",
    paymentValidated: false,
    totalAmount: 15000,
  },
]

export const mockDeliveryLogs: DeliveryLog[] = [
  {
    id: "log_1",
    saleId: "sale_2",
    standId: "stand_A",
    timestamp: mockSales.find((s) => s.id === "sale_2")!.deliveryTimestamp!,
    scannedQrData: mockSales.find((s) => s.id === "sale_2")!.deliveryQrValue!,
  },
]

export const mockDeliveries = [
  {
    id: "delivery_1",
    productId: "prod_1",
    standId: "stand_A",
    quantity: 5,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "delivery_2",
    productId: "prod_4",
    standId: "stand_A",
    quantity: 10,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "delivery_3",
    productId: "prod_1",
    standId: "stand_B",
    quantity: 8,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "delivery_4",
    productId: "prod_2",
    standId: "stand_B",
    quantity: 5,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "delivery_5",
    productId: "prod_3",
    standId: "stand_B",
    quantity: 4,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
]

// Helper functions
export const getRemainingStockAtStand = (stand: Stand, productId: string): number => {
  const productStock = stand.stock.find((s) => s.productId === productId)
  return productStock ? productStock.assignedQuantity - productStock.deliveredQuantity : 0
}

export const getTotalAssignedStock = (product: Product): number => {
  return mockStands.reduce((total, stand) => {
    const standStock = stand.stock.find((s) => s.productId === product.product_id)
    return total + (standStock ? standStock.assignedQuantity : 0)
  }, 0)
}

export const getTotalRemainingStock = (product: Product): number => {
  const totalAssigned = getTotalAssignedStock(product)
  return (product.total_quantity || 0) - totalAssigned
}

// Función para obtener precio de producto
export const getProductPrice = (productId: string): number => {
  const priceMap: { [key: string]: number } = {
    prod_1: 25000, // Campera de Cuero
    prod_2: 18000, // Jeans Slim
    prod_3: 8500, // Remera Básica
    prod_4: 32000, // Zapatillas Deportivas
    prod_5: 15000, // Buzo con Capucha
    prod_6: 22000, // Vestido Casual
  }
  return priceMap[productId] || 10000
}
