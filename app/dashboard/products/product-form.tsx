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
import { Upload, X } from "lucide-react"

interface ProductFormProps {
  onFormSubmitSuccess: () => void // Callback para cerrar el diálogo
}

const SIZES = ["S", "M", "L", "XL", "XXL"]

export default function ProductForm({ onFormSubmitSuccess }: ProductFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5)
  const [variants, setVariants] = useState<Array<{ size: string; quantity: number | string }>>(
    SIZES.map((size) => ({ size, quantity: "" })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVariantQuantityChange = (size: string, quantity: string) => {
    setVariants((prev) => prev.map((v) => (v.size === size ? { ...v, quantity } : v)))
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setImageFile(null)
    setImagePreview(null)
    setLowStockThreshold(5)
    setVariants(SIZES.map((size) => ({ size, quantity: "" })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let uploadedImageUrl: string | null = null

    // Paso 1: Subir la imagen si existe
    if (imageFile) {
      try {
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(imageFile.name)}`, {
          method: "POST",
          body: imageFile,
        })

        if (!response.ok) {
          throw new Error("Error al subir la imagen.")
        }

        const newBlob = await response.json()
        uploadedImageUrl = newBlob.url
      } catch (error) {
        console.error(error)
        toast({
          title: "Error de Subida",
          description: "No se pudo subir la imagen. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
    }

    // Paso 2: Preparar y enviar los datos del producto a la Server Action
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
      image_url: uploadedImageUrl, // Usar la URL de la imagen subida
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
          <div>
            <Label>Imagen del Producto</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      layout="fill"
                      objectFit="contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={(e) => {
                        e.preventDefault()
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 4MB)</p>
                  </div>
                )}
                <Input id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
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
