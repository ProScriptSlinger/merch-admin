"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createProduct, updateProduct, getCategories, type CreateProductData, type UpdateProductData, type ProductWithDetails } from "@/lib/services/products"
import { X, Plus } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Category = Database['public']['Tables']['categories']['Row']

interface ProductFormProps {
  onFormSubmitSuccess: () => void
  product?: ProductWithDetails | null // Optional product for editing
}

const SIZES = ["S", "M", "L", "XL"]

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface ExistingImage {
  id: string
  image_url: string
  is_primary: boolean
  sort_order: number
}

export default function ProductForm({ onFormSubmitSuccess, product }: ProductFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5)
  const [variants, setVariants] = useState<Array<{ size: string; quantity: number | string; price: number | string }>>(
    SIZES.map((size) => ({ size, quantity: "", price: "" })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isEditing = !!product

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || "")
      setCategoryId(product.category_id || "")
      setLowStockThreshold(product.low_stock_threshold || "")
      setExistingImages(product.images)

      // Load variants
      const loadedVariants = SIZES.map((size) => {
        const existingVariant = product.variants.find(v => v.size === size)
        return {
          size,
          quantity: existingVariant?.quantity || "",
          price: existingVariant?.price || ""
        }
      })
      setVariants(loadedVariants)
    }
  }, [product])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file && (imageFiles.length + existingImages.length) < 5) {
        // Límite de 5 imágenes total
        const reader = new FileReader()
        reader.onloadend = () => {
          const newImageFile: ImageFile = {
            file,
            preview: reader.result as string,
            id: Math.random().toString(36).substr(2, 9),
          }
          setImageFiles((prev) => [...prev, newImageFile])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset input
    e.target.value = ""
  }

  const removeImage = (imageId: string) => {
    setImageFiles((prev) => prev.filter((img) => img.id !== imageId))
  }

  const removeExistingImage = async (imageId: string) => {
    const imageToRemove = existingImages.find(img => img.id === imageId)

    if (imageToRemove) {
      try {
        // Extract file path from the image URL
        const urlParts = imageToRemove.image_url.split('/')
        const bucketIndex = urlParts.findIndex(part => part === 'merch')

        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')

          // Delete from Supabase storage
          const response = await fetch(`/api/upload/delete?path=${encodeURIComponent(filePath)}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            console.warn('Failed to delete image from storage:', filePath)
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    // Remove from local state regardless of storage deletion result
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleVariantChange = (size: string, field: 'quantity' | 'price', value: string) => {
    setVariants((prev) => prev.map((v) => (v.size === size ? { ...v, [field]: value } : v)))
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setCategoryId("")
    setImageFiles([])
    setExistingImages([])
    setLowStockThreshold(5)
    setVariants(SIZES.map((size) => ({ size, quantity: "", price: "" })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setIsSubmitting(true)

      const uploadedImageUrls: string[] = []

      // Paso 1: Subir todas las nuevas imágenes
      if (imageFiles.length > 0) {
        try {
          for (const imageFile of imageFiles) {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(imageFile.file.name)}`, {
              method: "POST",
              body: imageFile.file,
            })

            if (!response.ok) {
              throw new Error(`Error al subir la imagen ${imageFile.file.name}`)
            }

            const newBlob = await response.json()
            uploadedImageUrls.push(newBlob.url)
          }
        } catch (error) {
          console.error(error)
          toast({
            title: "Error de Subida",
            description: "No se pudieron subir todas las imágenes. Por favor, inténtelo de nuevo.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Paso 2: Preparar y enviar los datos del producto
      const parsedVariants = variants
        .map((v) => ({
          size: v.size,
          quantity: Number.parseInt(String(v.quantity), 10),
          price: Number.parseFloat(String(v.price))
        }))
        .filter((v) => !isNaN(v.quantity) && v.quantity >= 0 && !isNaN(v.price) && v.price > 0)

      if (parsedVariants.length === 0) {
        toast({
          title: "Error de Validación",
          description: "Debe ingresar stock y precio para al menos una talla.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Combine existing image URLs with new uploaded URLs
      const allImageUrls = [
        ...existingImages.map(img => img.image_url),
        ...uploadedImageUrls
      ]

      try {
        if (isEditing && product) {
          // Update existing product
          const updateData: UpdateProductData = {
            name,
            description,
            category_id: categoryId || null,
            low_stock_threshold: lowStockThreshold === "" ? undefined : Number(lowStockThreshold),
            variants: parsedVariants,
            image_urls: allImageUrls.length > 0 ? allImageUrls : undefined,
          }

          await updateProduct(product.id, updateData)
          toast({
            title: "¡Éxito!",
            description: "Producto actualizado correctamente",
          })
        } else {
          // Create new product
          const productData: CreateProductData = {
            name,
            description,
            category_id: categoryId || null,
            image_urls: allImageUrls.length > 0 ? allImageUrls : undefined,
            variants: parsedVariants,
            low_stock_threshold: lowStockThreshold === "" ? undefined : Number(lowStockThreshold),
          }

          await createProduct(productData)
          toast({
            title: "¡Éxito!",
            description: "Producto creado correctamente",
          })
          resetForm()
        }

        onFormSubmitSuccess()
      } catch (error) {
        console.error('Error saving product:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`,
          variant: "destructive",
        })
      }
      setIsSubmitting(false)
    } catch (e) {
      console.error(e)
    }

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Datos del producto */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="low_stock_threshold">Umbral de Stock Bajo (Opcional)</Label>
            <Input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          {/* Sección de imágenes mejorada */}
          <div>
            <Label>Imágenes del Producto (máximo 5)</Label>
            <div className="mt-2 space-y-4">
              {/* Botón para agregar imágenes */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Agregar imágenes</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 4MB c/u)</p>
                    <p className="text-xs text-muted-foreground">{(imageFiles.length + existingImages.length)}/5 imágenes seleccionadas</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Vista previa de imágenes existentes */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <Image
                        src={image.image_url}
                        alt="Existing product image"
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Vista previa de nuevas imágenes */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageFiles.map((imageFile) => (
                    <div key={imageFile.id} className="relative group">
                      <Image
                        src={imageFile.preview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(imageFile.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Variantes y stock */}
        <div className="space-y-6">
          <div>
            <Label>Variantes y Stock</Label>
            <div className="mt-4 space-y-4">
              {variants.map((variant) => (
                <div key={variant.size} className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{variant.size}</Label>
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${variant.size}`} className="text-sm font-medium">
                      Cantidad
                    </Label>
                    <Input
                      id={`quantity-${variant.size}`}
                      type="number"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(variant.size, 'quantity', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${variant.size}`} className="text-sm font-medium">
                      Precio
                    </Label>
                    <Input
                      id={`price-${variant.size}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(variant.size, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={resetForm}>
          Limpiar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? "Actualizando..." : "Creando...") : (isEditing ? "Actualizar Producto" : "Crear Producto")}
        </Button>
      </div>
    </form>
  )
}
