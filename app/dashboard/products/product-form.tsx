"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createProduct } from "./actions"
import type { NewProductData } from "@/lib/types"

interface ProductFormProps {
  onFormSubmitSuccess: () => void
}

const SIZES = ["S", "M", "L", "XL", "XXL", "One Size"]

export default function ProductForm({ onFormSubmitSuccess }: ProductFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(5)
  const [variants, setVariants] = useState<Array<{ size: string; quantity: number | string }>>(
    SIZES.map((size) => ({ size, quantity: "" })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleVariantQuantityChange = (size: string, quantity: string) => {
    setVariants((prev) => prev.map((v) => (v.size === size ? { ...v, quantity } : v)))
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setImageUrl("")
    setLowStockThreshold(5)
    setVariants(SIZES.map((size) => ({ size, quantity: "" })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const parsedVariants = variants
      .map((v) => ({ size: v.size, quantity: Number.parseInt(String(v.quantity), 10) }))
      .filter((v) => !isNaN(v.quantity) && v.quantity > 0)

    const totalInitialStock = parsedVariants.reduce((sum, v) => sum + v.quantity, 0)
    if (totalInitialStock === 0) {
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
      image_url: imageUrl || `/placeholder.svg?width=400&height=400&query=${encodeURIComponent(name)}`,
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
            <Label htmlFor="image_url">URL de Imagen (Opcional)</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
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
        </div>

        <fieldset className="space-y-2 border p-4 rounded-md self-start">
          <legend className="text-sm font-medium px-1">Tallas y Stock</legend>
          {variants.map((variant) => (
            <div key={variant.size} className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor={`size-${variant.size}`} className="col-span-1">
                {variant.size}
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
