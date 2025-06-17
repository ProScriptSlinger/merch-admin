"use server"

import { revalidatePath } from "next/cache"
import type { Product, NewProductData } from "@/lib/types"
import { mockProducts } from "@/lib/data"

// Función para obtener productos (usando datos mock)
export async function getProducts(): Promise<Product[]> {
  try {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockProducts
  } catch (error: any) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

// Función para crear producto (simulada con datos mock)
export async function createProduct(
  data: NewProductData,
): Promise<{ success: boolean; message: string; product?: Product }> {
  const { name, category, image_url, variants, low_stock_threshold } = data

  if (!name || !variants || variants.length === 0) {
    return { success: false, message: "El nombre y al menos una variante de talla son obligatorios." }
  }

  if (variants.some((v) => typeof v.quantity !== "number" || v.quantity < 0)) {
    return { success: false, message: "La cantidad para cada talla debe ser un número válido y no negativo." }
  }

  try {
    // Simular creación de producto
    const newProduct: Product = {
      product_id: `prod_${Date.now()}`,
      name,
      category,
      image_url,
      variants: variants.map((v, index) => ({
        variant_id: `var_${Date.now()}_${index}`,
        product_id: `prod_${Date.now()}`,
        size: v.size,
        quantity: v.quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      total_quantity: variants.reduce((sum, v) => sum + v.quantity, 0),
      low_stock_threshold,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Agregar a los datos mock (en una aplicación real, esto se guardaría en la BD)
    mockProducts.push(newProduct)

    revalidatePath("/dashboard/products")
    return { success: true, message: "Producto creado exitosamente!", product: newProduct }
  } catch (error: any) {
    console.error("Error al crear producto:", error)
    return {
      success: false,
      message: `Error al crear producto: ${error.message || "Error desconocido"}`,
    }
  }
}

// Función para eliminar producto (simulada)
export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
  if (!productId) {
    return { success: false, message: "Se requiere el ID del producto." }
  }

  try {
    // Simular eliminación
    const index = mockProducts.findIndex((p) => p.product_id === productId)
    if (index > -1) {
      mockProducts.splice(index, 1)
      revalidatePath("/dashboard/products")
      return { success: true, message: "Producto eliminado exitosamente." }
    } else {
      return { success: false, message: "Producto no encontrado." }
    }
  } catch (error: any) {
    console.error("Error al eliminar producto:", error)
    return { success: false, message: `Error al eliminar producto: ${error.message || "Error desconocido"}` }
  }
}
