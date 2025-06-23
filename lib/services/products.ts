import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']

export interface ProductWithDetails extends Product {
  category: Category | null
  variants: ProductVariant[]
  images: ProductImage[]
  total_quantity: number
}

export interface CreateProductData {
  name: string
  category_id?: string | null
  description?: string | null
  low_stock_threshold?: number
  variants: Array<{
    size: string
    quantity: number
    price: number
  }>
  image_urls?: string[]
}

export interface UpdateProductData {
  name?: string
  category_id?: string | null
  description?: string | null
  low_stock_threshold?: number
  variants?: Array<{
    size: string
    quantity: number
    price: number
  }>
  image_urls?: string[]
}

// Create a service role client for admin operations
const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Fetch all products with details
export async function getProducts(): Promise<ProductWithDetails[]> {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false })

  if (productsError) {
    throw new Error(`Error fetching products: ${productsError.message}`)
  }

  return products.map(product => ({
    ...product,
    total_quantity: product.variants.reduce((sum: number, variant: ProductVariant) => sum + variant.quantity, 0)
  }))
}

// Fetch single product with details
export async function getProduct(id: string): Promise<ProductWithDetails | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching product: ${error.message}`)
  }

  return {
    ...product,
    total_quantity: product.variants.reduce((sum: number, variant: ProductVariant) => sum + variant.quantity, 0)
  }
}

// Create new product (using service role for admin operations)
export async function createProduct(productData: CreateProductData): Promise<ProductWithDetails> {
  const serviceClient = createServiceClient()
  
  const { data: product, error: productError } = await serviceClient
    .from('products')
    .insert({
      name: productData.name,
      category_id: productData.category_id,
      description: productData.description,
      low_stock_threshold: productData.low_stock_threshold || 5,
    })
    .select()
    .single()

  if (productError) {
    throw new Error(`Error creating product: ${productError.message}`)
  }

  // Create variants
  if (productData.variants.length > 0) {
    const variants = productData.variants.map(variant => ({
      product_id: product.id,
      size: variant.size,
      quantity: variant.quantity,
      price: variant.price,
    }))

    const { error: variantsError } = await serviceClient
      .from('product_variants')
      .insert(variants)

    if (variantsError) {
      throw new Error(`Error creating variants: ${variantsError.message}`)
    }
  }

  // Create images
  if (productData.image_urls && productData.image_urls.length > 0) {
    const images = productData.image_urls.map((url, index) => ({
      product_id: product.id,
      image_url: url,
      is_primary: index === 0,
      sort_order: index,
    }))

    const { error: imagesError } = await serviceClient
      .from('product_images')
      .insert(images)

    if (imagesError) {
      throw new Error(`Error creating images: ${imagesError.message}`)
    }
  }

  return getProduct(product.id) as Promise<ProductWithDetails>
}

// Update product (using service role for admin operations)
export async function updateProduct(id: string, productData: UpdateProductData): Promise<ProductWithDetails> {
  const serviceClient = createServiceClient()
  
  const { error: productError } = await serviceClient
    .from('products')
    .update({
      name: productData.name,
      category_id: productData.category_id,
      description: productData.description,
      low_stock_threshold: productData.low_stock_threshold,
    })
    .eq('id', id)

  if (productError) {
    throw new Error(`Error updating product: ${productError.message}`)
  }

  // Update variants if provided
  if (productData.variants) {
    // Delete existing variants
    const { error: deleteError } = await serviceClient
      .from('product_variants')
      .delete()
      .eq('product_id', id)

    if (deleteError) {
      throw new Error(`Error deleting variants: ${deleteError.message}`)
    }

    // Create new variants
    const variants = productData.variants.map(variant => ({
      product_id: id,
      size: variant.size,
      quantity: variant.quantity,
      price: variant.price,
    }))

    const { error: variantsError } = await serviceClient
      .from('product_variants')
      .insert(variants)

    if (variantsError) {
      throw new Error(`Error creating variants: ${variantsError.message}`)
    }
  }

  // Update images if provided
  if (productData.image_urls) {
    // Delete existing images
    const { error: deleteError } = await serviceClient
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (deleteError) {
      throw new Error(`Error deleting images: ${deleteError.message}`)
    }

    // Create new images
    const images = productData.image_urls.map((url, index) => ({
      product_id: id,
      image_url: url,
      is_primary: index === 0,
      sort_order: index,
    }))

    const { error: imagesError } = await serviceClient
      .from('product_images')
      .insert(images)

    if (imagesError) {
      throw new Error(`Error creating images: ${imagesError.message}`)
    }
  }

  return getProduct(id) as Promise<ProductWithDetails>
}

// Delete product (using service role for admin operations)
export async function deleteProduct(id: string): Promise<void> {
  const serviceClient = createServiceClient()
  
  const { error } = await serviceClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`)
  }
}

// Fetch categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Error fetching categories: ${error.message}`)
  }

  return data
}

// Update product variant quantity
export async function updateProductVariantQuantity(
  variantId: string,
  quantity: number,
  reason: string = 'Manual adjustment'
): Promise<void> {
  // Get current quantity
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('quantity')
    .eq('id', variantId)
    .single()

  if (fetchError) {
    throw new Error(`Error fetching variant: ${fetchError.message}`)
  }

  const previousQuantity = variant.quantity

  // Update quantity
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ quantity })
    .eq('id', variantId)

  if (updateError) {
    throw new Error(`Error updating variant: ${updateError.message}`)
  }

  // Log stock movement
  const { error: logError } = await supabase
    .from('stock_movements')
    .insert({
      product_variant_id: variantId,
      movement_type: 'adjustment',
      quantity: quantity - previousQuantity,
      previous_quantity: previousQuantity,
      new_quantity: quantity,
      reason,
    })

  if (logError) {
    console.error('Error logging stock movement:', logError)
  }
} 