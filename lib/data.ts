// Mock data for demonstration
import type { Product, Stand, DeliveryLog, Sale } from "./types"

export const mockProducts: Product[] = [
  {
    product_id: "prod_1",
    name: "Camiseta Evento 2024",
    category: "Apparel",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_1_1",
        product_id: "prod_1",
        size: "S",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_2",
        product_id: "prod_1",
        size: "M",
        quantity: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_3",
        product_id: "prod_1",
        size: "L",
        quantity: 35,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_4",
        product_id: "prod_1",
        size: "XL",
        quantity: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_1_5",
        product_id: "prod_1",
        size: "XXL",
        quantity: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 130,
    low_stock_threshold: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_2",
    name: "Hoodie Oficial",
    category: "Apparel",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_2_1",
        product_id: "prod_2",
        size: "S",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_2",
        product_id: "prod_2",
        size: "M",
        quantity: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_3",
        product_id: "prod_2",
        size: "L",
        quantity: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_4",
        product_id: "prod_2",
        size: "XL",
        quantity: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_2_5",
        product_id: "prod_2",
        size: "XXL",
        quantity: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 80,
    low_stock_threshold: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_3",
    name: "Gorra Snapback",
    category: "Accessories",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_3_1",
        product_id: "prod_3",
        size: "One Size",
        quantity: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 50,
    low_stock_threshold: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_4",
    name: "Botella de Agua",
    category: "Accessories",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_4_1",
        product_id: "prod_4",
        size: "One Size",
        quantity: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 100,
    low_stock_threshold: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_5",
    name: "Tote Bag",
    category: "Accessories",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_5_1",
        product_id: "prod_5",
        size: "One Size",
        quantity: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 75,
    low_stock_threshold: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: "prod_6",
    name: "Sudadera Zip",
    category: "Apparel",
    image_url: "/placeholder.svg?width=400&height=400",
    variants: [
      {
        variant_id: "var_6_1",
        product_id: "prod_6",
        size: "S",
        quantity: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_2",
        product_id: "prod_6",
        size: "M",
        quantity: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_3",
        product_id: "prod_6",
        size: "L",
        quantity: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_4",
        product_id: "prod_6",
        size: "XL",
        quantity: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        variant_id: "var_6_5",
        product_id: "prod_6",
        size: "XXL",
        quantity: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_quantity: 60,
    low_stock_threshold: 6,
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
      { productId: "prod_1", productName: "Camiseta Evento 2024", assignedQuantity: 30, deliveredQuantity: 5 },
      { productId: "prod_3", productName: "Gorra Snapback", assignedQuantity: 20, deliveredQuantity: 3 },
      { productId: "prod_4", productName: "Botella de Agua", assignedQuantity: 40, deliveredQuantity: 10 },
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
      { productId: "prod_1", productName: "Camiseta Evento 2024", assignedQuantity: 25, deliveredQuantity: 8 },
      { productId: "prod_2", productName: "Hoodie Oficial", assignedQuantity: 20, deliveredQuantity: 5 },
      { productId: "prod_5", productName: "Tote Bag", assignedQuantity: 15, deliveredQuantity: 2 },
      { productId: "prod_6", productName: "Sudadera Zip", assignedQuantity: 12, deliveredQuantity: 3 },
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
      { productId: "prod_3", productName: "Gorra Snapback", assignedQuantity: 15, deliveredQuantity: 4 },
      { productId: "prod_4", productName: "Botella de Agua", assignedQuantity: 35, deliveredQuantity: 12 },
      { productId: "prod_5", productName: "Tote Bag", assignedQuantity: 20, deliveredQuantity: 6 },
    ],
  },
]

export const mockSales: Sale[] = [
  {
    id: "sale_1",
    email: "customer1@example.com",
    items: [{ productId: "prod_1", productName: "Camiseta Evento 2024", quantity: 1 }],
    saleDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    saleType: "Online",
    status: "Pending",
    deliveryQrValue: "SALE_QR_ONLINE_1",
  },
  {
    id: "sale_2",
    email: "customer2@example.com",
    items: [
      { productId: "prod_2", productName: "Hoodie Oficial", quantity: 1 },
      { productId: "prod_4", productName: "Botella de Agua", quantity: 2 },
    ],
    saleDate: new Date(Date.now() - 86400000).toISOString(),
    saleType: "Online",
    status: "Delivered",
    deliveryQrValue: "SALE_QR_ONLINE_2",
    deliveredByStandId: "stand_A",
    deliveryTimestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "sale_3",
    email: "pos_customer1@example.com",
    items: [{ productId: "prod_3", productName: "Gorra Snapback", quantity: 1 }],
    saleDate: new Date(Date.now() - 7200000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_B",
    deliveredByStandId: "stand_B",
    deliveryTimestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "sale_4",
    email: "customer3@example.com",
    items: [{ productId: "prod_1", productName: "Camiseta Evento 2024", quantity: 2 }],
    saleDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    saleType: "Online",
    status: "Pending",
    deliveryQrValue: "SALE_QR_ONLINE_3",
  },
  {
    id: "sale_5",
    email: "pos_customer2@example.com",
    items: [{ productId: "prod_4", productName: "Botella de Agua", quantity: 1 }],
    saleDate: new Date(Date.now() - 14400000).toISOString(),
    saleType: "POS",
    status: "Delivered",
    standId: "stand_A",
    deliveredByStandId: "stand_A",
    deliveryTimestamp: new Date(Date.now() - 14400000).toISOString(),
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
