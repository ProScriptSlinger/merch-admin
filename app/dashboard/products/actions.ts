"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db" // Asegúrate que db esté correctamente inicializado desde lib/db.ts
import type { Product, ProductVariant, NewProductData } from "@/lib/types"

// Helper para obtener variantes de un producto
async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  let variants: ProductVariant[] = []
  try {
    // VERIFICA: ¿Existe la tabla 'product_variant' exactamente con este nombre (minúsculas)?
    // VERIFICA: ¿Tiene el usuario de BD permisos de SELECT en 'product_variant'?
    variants = await db<ProductVariant[]>`
      SELECT variant_id, product_id, size, quantity, created_at, updated_at
      FROM product_variant 
      WHERE product_id = ${productId}
      ORDER BY CASE size
        WHEN 'S' THEN 1
        WHEN 'M' THEN 2
        WHEN 'L' THEN 3
        WHEN 'XL' THEN 4
        WHEN 'XXL' THEN 5
        ELSE 6
      END
    `
    if (!Array.isArray(variants)) {
      console.error("--- RESPUESTA INESPERADA DE BD en getProductVariants ---")
      console.error("Timestamp:", new Date().toISOString())
      console.error("Se esperaba un array de la BD para 'product_variant', pero se recibió tipo:", typeof variants)
      console.error("Valor recibido (primeros 500 caracteres):", String(variants).substring(0, 500)) // ¡REVISA ESTO EN LOS LOGS DE VERCEL!
      console.error("--- FIN RESPUESTA INESPERADA (getProductVariants) ---")
      throw new Error(
        `La consulta a la BD para 'product_variant' no devolvió un array. Recibido: ${String(variants).substring(0, 100)}... Revise conexión, auth, y nombre de tabla.`,
      )
    }
  } catch (e: any) {
    console.error("Error DENTRO de getProductVariants al consultar la tabla 'product_variant':", e.message)
    throw e
  }
  return variants
}

export async function getProducts(): Promise<Product[]> {
  try {
    // VERIFICA: ¿Existe la tabla 'product' exactamente con este nombre (minúsculas)?
    // VERIFICA: ¿Tiene el usuario de BD permisos de SELECT en 'product'?
    const productsData = await db<Omit<Product, "variants" | "total_quantity">[]>`
      SELECT 
        product_id, 
        name, 
        category, 
        image_url, 
        low_stock_threshold, 
        created_at, 
        updated_at 
      FROM product 
      ORDER BY name ASC
    `

    if (!Array.isArray(productsData)) {
      console.error("--- RESPUESTA INESPERADA DE BD en getProducts (productsData) ---")
      console.error("Timestamp:", new Date().toISOString())
      console.error("Se esperaba un array de la BD para 'product', pero se recibió tipo:", typeof productsData)
      console.error("Valor recibido (primeros 500 caracteres):", String(productsData).substring(0, 500)) // ¡REVISA ESTO EN LOS LOGS DE VERCEL!
      console.error("--- FIN RESPUESTA INESPERADA ---")
      throw new Error(
        `La consulta a la BD para 'product' no devolvió un array. Recibido: ${String(productsData).substring(0, 100)}... Esto usualmente indica un problema de conexión o autenticación con el servicio de BD, o nombre de tabla incorrecto.`,
      )
    }

    const productsWithVariants: Product[] = []
    for (const p of productsData) {
      const variants = await getProductVariants(p.product_id)
      const total_quantity = variants.reduce((sum, v) => sum + v.quantity, 0)
      productsWithVariants.push({ ...p, variants, total_quantity })
    }

    return productsWithVariants
  } catch (error: any) {
    // Este es el bloque catch que estás viendo en tus logs de Vercel
    console.error("--------------------------------------------------")
    console.error("FALLO CONSULTA A BD en getProducts Server Action:") // Esta línea la ves
    console.error("Timestamp:", new Date().toISOString())

    let detailedErrorMessage = "Error desconocido ocurrió."

    if (error instanceof Error) {
      detailedErrorMessage = error.message
      console.error("Tipo de Error:", error.name)
      console.error("Mensaje de Error:", error.message) // ¡ESTA LÍNEA ES CRUCIAL! ¿Qué dice en tus logs de Vercel? Debería ser el "Unexpected token 'I'..."
      if (error.stack) {
        console.error("Pila de Error (primeros 500 caracteres):", error.stack.substring(0, 500))
      }
    } else {
      try {
        detailedErrorMessage = JSON.stringify(error)
      } catch {
        detailedErrorMessage = String(error)
      }
      console.error("Capturó un error no estándar. Valor stringificado:", detailedErrorMessage)
    }

    console.error(
      "IMPORTANTE: El error 'Unexpected token 'I', \"Invalid re\"... es no válido JSON' usualmente significa que el cliente de la base de datos (@neondatabase/serverless) recibió una respuesta NO JSON (ej. una página de error HTML o texto plano) desde el proxy de la base de datos Neon.",
    )
    console.error(
      "CAUSAS PROBABLES: \n1. `POSTGRES_URL` incorrecta/incompleta (verificar nombre de BD, sslmode, credenciales). \n2. Base de datos Neon pausada/suspendida o con problemas. \n3. Nombres de tabla 'product' o 'product_variant' no coinciden con la BD (sensible a mayúsculas si se usaron comillas en CREATE TABLE). \n4. Permisos insuficientes para el usuario de BD.",
    )
    console.error(
      "ACCIÓN INMEDIATA: Revise los logs de Vercel para el 'Valor recibido' si la consulta no devolvió un array. Verifique su `POSTGRES_URL` en Vercel y el estado de su BD en Neon. Confirme los nombres de tabla y permisos.",
    )
    console.error("--------------------------------------------------")
    return []
  }
}

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

  let newProductEntry: Omit<Product, "variants" | "total_quantity"> | undefined = undefined
  const insertedVariants: ProductVariant[] = []

  try {
    const productInsertResult = await db<Omit<Product, "variants" | "total_quantity">[]>`
      INSERT INTO product (name, category, image_url, low_stock_threshold)
      VALUES (${name}, ${category}, ${image_url}, ${low_stock_threshold})
      RETURNING product_id, name, category, image_url, low_stock_threshold, created_at, updated_at
    `

    if (!productInsertResult || productInsertResult.length === 0 || !productInsertResult[0].product_id) {
      console.error("Fallo al insertar en tabla 'product'. Resultado:", productInsertResult)
      throw new Error("No se pudo crear la entrada principal del producto.")
    }
    newProductEntry = productInsertResult[0]
    const product_id = newProductEntry.product_id

    for (const variant of variants) {
      if (variant.quantity > 0) {
        const variantInsertResult = await db<ProductVariant[]>`
          INSERT INTO product_variant (product_id, size, quantity)
          VALUES (${product_id}, ${variant.size}, ${variant.quantity})
          RETURNING variant_id, product_id, size, quantity, created_at, updated_at
        `
        if (variantInsertResult && variantInsertResult.length > 0) {
          insertedVariants.push(variantInsertResult[0])
        } else {
          console.warn(
            `No se pudo insertar la variante ${variant.size} para el producto ${product_id}. Resultado:`,
            variantInsertResult,
          )
        }
      }
    }

    const finalProduct: Product = {
      ...newProductEntry,
      variants: insertedVariants,
      total_quantity: insertedVariants.reduce((sum, v) => sum + v.quantity, 0),
    }

    revalidatePath("/dashboard/products")
    return { success: true, message: "Producto creado exitosamente!", product: finalProduct }
  } catch (error: any) {
    console.error("--------------------------------------------------")
    console.error("FALLO CONSULTA A BD en createProduct Server Action:")
    console.error("Timestamp:", new Date().toISOString())
    let detailedErrorMessage = "Error desconocido ocurrió."
    if (error instanceof Error) {
      detailedErrorMessage = error.message
      console.error("Tipo de Error:", error.name)
      console.error("Mensaje de Error:", error.message)
      if (error.stack) {
        console.error("Pila de Error (primeros 500 caracteres):", error.stack.substring(0, 500))
      }
    } else {
      try {
        detailedErrorMessage = JSON.stringify(error)
      } catch {
        detailedErrorMessage = String(error)
      }
      console.error("Capturó un error no estándar. Valor stringificado:", detailedErrorMessage)
    }
    console.error("Mensaje de error que se mostraría al usuario:", `Error al crear producto: ${detailedErrorMessage}`)
    console.error(
      "CAUSAS PROBABLES: `POSTGRES_URL` incorrecta, BD Neon pausada, nombres de tabla incorrectos, o permisos de BD.",
    )
    console.error("--------------------------------------------------")
    return {
      success: false,
      message: `Error al crear producto: ${detailedErrorMessage}`,
    }
  }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
  if (!productId) {
    return { success: false, message: "Se requiere el ID del producto." }
  }
  try {
    await db`DELETE FROM product WHERE product_id = ${productId}`
    revalidatePath("/dashboard/products")
    return { success: true, message: "Producto eliminado exitosamente." }
  } catch (error: any) {
    console.error("Error al eliminar producto:", error)
    return { success: false, message: `Error al eliminar producto: ${error.message || "Error desconocido"}` }
  }
}
