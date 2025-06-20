"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createProduct } from "./actions"
import type { NewProductData } from "@/lib/types"
import { X, Plus } from "lucide-react"

interface ProductFormProps {
  onFormSubmitSuccess: () => void
}

const SIZES = ["S", "M", "L", "XL", "XXL"]

interface ImageFile {
  file: File
  preview: string
  id: string
}

export default function ProductForm({ onFormSubmitSuccess }: ProductFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5)
  const [variants, setVariants] = useState<Array<{ size: string; quantity: number | string }>>(
    SIZES.map((size) => ({ size, quantity: "" })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file && imageFiles.length < 5) {
        // Límite de 5 imágenes
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

  const handleVariantQuantityChange = (size: string, quantity: string) => {
    setVariants((prev) => prev.map((v) => (v.size === size ? { ...v, quantity } : v)))
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setImageFiles([])
    setLowStockThreshold(5)
    setVariants(SIZES.map((size) => ({ size, quantity: "" })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const uploadedImageUrls: string[] = []

    // Paso 1: Subir todas las imágenes
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
      .map((v) => ({ size: v.size, quantity: Number.parseInt(String(v.quantity), 10) }))
      .filter((v) => !isNaN(v.quantity) && v.quantity >= 0)

    const totalInitialStock = parsedVariants.reduce((sum, v) => sum + v.quantity, 0)
    if (
      totalInitialStock === 0 &&
      variants.every((v) => String(v.quantity).trim() === "" || Number(v.quantity) === 0)
    ) {
      toast({
        title: "Error de Validación",
        description: "Debe ingresar stock para al menos una talla.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const productData: NewProductData = {
      name,
      category: category || null,
      image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
      variants: parsedVariants,
      low_stock_threshold: lowStockThreshold === "" ? null : Number(lowStockThreshold),
    }

    const result = await createProduct(productData)

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
      })
      resetForm()
      onFormSubmitSuccess()
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
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
            <Label htmlFor="category">Categoría</Label>
            <Input id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} />
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
                    <p className="text-xs text-muted-foreground">{imageFiles.length}/5 imágenes seleccionadas</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    disabled={imageFiles.length >= 5}
                  />
                </label>
              </div>

              {/* Vista previa de imágenes */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {imageFiles.map((imageFile) => (
                    <div key={imageFile.id} className="relative group">
                      <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                        <Image
                          src={imageFile.preview || "/placeholder.svg"}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(imageFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{imageFile.file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tallas y Stock */}
        <fieldset className="space-y-2 border p-4 rounded-md self-start">
          <legend className="text-sm font-medium px-1">Tallas y Stock</legend>
          {variants.map((variant) => (
            <div key={variant.size} className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor={`size-${variant.size}`} className="col-span-1">
                Talla {variant.size}
              </Label>
              <Input
                id={`size-${variant.size}`}
                name={`quantity-${variant.size}`}
                type="number"
                min="0"
                placeholder="Cantidad"
                value={variant.quantity}
                onChange={(e) => handleVariantQuantityChange(variant.size, e.target.value)}
                className="col-span-2"
              />
            </div>
          ))}
        </fieldset>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creando Producto..." : "Crear Producto"}
      </Button>
    </form>
  )
}
