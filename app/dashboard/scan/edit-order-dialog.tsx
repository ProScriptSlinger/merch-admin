"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Plus, Package, ShoppingCart, Edit3, Save, X, Shirt, DollarSign } from "lucide-react"
import type { OrderWithDetails } from "@/lib/services/orders"
import { getProductVariantsForAssignment } from "@/lib/services/stands"
import Image from "next/image"

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderItems: OrderWithDetails['items']
  onSaveChanges: (updatedItems: OrderWithDetails['items']) => void
}

interface ProductVariant {
  id: string
  size: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    images: string[]
  }
}

export function EditOrderDialog({ open, onOpenChange, orderItems, onSaveChanges }: EditOrderDialogProps) {
  const [items, setItems] = useState<OrderWithDetails['items']>(orderItems)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Fetch product variants when dialog opens
  useEffect(() => {
    if (open) {
      fetchProductVariants()
    }
  }, [open])

  const fetchProductVariants = async () => {
    setIsLoadingProducts(true)
    try {
      const variants = await getProductVariantsForAssignment()
      setProductVariants(variants)
    } catch (error) {
      console.error("Error fetching product variants:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setItems(items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const addNewProduct = () => {
    if (!selectedProductId || !selectedSize) return

    const selectedVariant = productVariants.find(v => v.id === selectedProductId)
    if (!selectedVariant) return

    // Find the specific variant with the selected size
    const sizeVariant = productVariants.find(v => 
      v.products.id === selectedVariant.products.id && v.size === selectedSize
    )
    if (!sizeVariant) return

    const newItem = {
      id: `item_${Date.now()}`,
      order_id: "",
      product_variant_id: sizeVariant.id,
      quantity: quantity,
      unit_price: sizeVariant.price,
      created_at: new Date().toISOString(),
      product_variant: {
        id: sizeVariant.id,
        product_id: sizeVariant.products.id,
        size: sizeVariant.size,
        quantity: sizeVariant.quantity,
        price: sizeVariant.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: {
          id: sizeVariant.products.id,
          name: sizeVariant.products.name,
          images: [],
        },
      },
    }

    setItems([...items, newItem])
    setSelectedProductId("")
    setSelectedSize("")
    setQuantity(1)
    setShowAddProduct(false)
  }

  const getAvailableSizes = (productId: string) => {
    const product = productVariants.find(v => v.products.id === productId)
    if (!product) return []
    
    // Get all sizes for this product
    return productVariants
      .filter(v => v.products.id === productId)
      .map(v => v.size)
  }

  const getProductVariantsByProduct = (productId: string) => {
    return productVariants.filter(v => v.products.id === productId)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.unit_price * item.quantity, 0)
  }

  const handleSave = () => {
    onSaveChanges(items)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit3 className="h-6 w-6 text-blue-600" />
            Editar Pedido
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Productos actuales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Productos en el Pedido ({items.length})
              </h3>

              {items.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay productos en el pedido</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            {item?.product_variant?.product?.images && item.product_variant.product.images.length > 0 ? (
                              <Image 
                                src={item.product_variant.product.images[0].image_url} 
                                alt={item.product_variant.product.name} 
                                width={48} 
                                height={48}
                                className="object-cover rounded"
                              />
                            ) : (
                              <Shirt className="h-6 w-6 text-muted-foreground dark:text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_variant.product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">Talle {item.product_variant.size}</Badge>
                              <span className="text-sm text-muted-foreground">
                                ${item.unit_price.toLocaleString()} c/u
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="text-right min-w-[100px]">
                            <p className="font-semibold">${(item.unit_price * item.quantity).toLocaleString()}</p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Agregar producto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Agregar Producto
                </h3>
                {!showAddProduct && (
                  <Button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Producto
                  </Button>
                )}
              </div>

              {showAddProduct && (
                <Card className="p-4 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Producto</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingProducts ? "Cargando..." : "Seleccionar..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {productVariants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{variant.products.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  Talle {variant.size} - ${variant.price.toLocaleString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Talle</Label>
                      <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!selectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Talle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const selectedVariant = productVariants.find(v => v.id === selectedProductId)
                            if (!selectedVariant) return []
                            
                            // Get all variants for this product
                            const productVariantsForProduct = productVariants.filter(v => 
                              v.products.id === selectedVariant.products.id
                            )
                            
                            return productVariantsForProduct.map((variant) => (
                              <SelectItem key={variant.size} value={variant.size}>
                                {variant.size} - ${variant.price.toLocaleString()}
                              </SelectItem>
                            ))
                          })()}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="invisible">Acciones</Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={addNewProduct}
                          disabled={!selectedProductId || !selectedSize}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Separator />

            {/* Total */}
            <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg border dark:border-gray-700">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total del Pedido:
                </span>
                <span className="text-2xl">${calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
