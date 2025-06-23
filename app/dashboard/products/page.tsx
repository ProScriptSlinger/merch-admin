"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProductForm from "./product-form"
import ProductsTable from "./products-table"
import StockAssignmentDialog from "./stock-assignment-dialog"
import { PlusCircle } from "lucide-react"
import { getProducts, type ProductWithDetails } from "@/lib/services/products"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/hooks/use-toast"

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="ml-2 text-muted-foreground">Cargando productos...</p>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null)
  const [selectedProductForAssignment, setSelectedProductForAssignment] = useState<ProductWithDetails | null>(null)
  const { subscribeToRealtime, unsubscribeFromRealtime } = useApp()
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

    // // Subscribe to real-time updates
    // subscribeToRealtime('products', (payload) => {
    //   console.log('Products real-time update:', payload)
    //   fetchProducts()
    // })

    // subscribeToRealtime('product_variants', (payload) => {
    //   console.log('Product variants real-time update:', payload)
    //   fetchProducts()
    // })

    // subscribeToRealtime('product_images', (payload) => {
    //   console.log('Product images real-time update:', payload)
    //   fetchProducts()
    // })

    // // Cleanup subscriptions
    // return () => {
    //   unsubscribeFromRealtime('products')
    //   unsubscribeFromRealtime('product_variants')
    //   unsubscribeFromRealtime('product_images')
    // }
  }, [])

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false)
    setEditingProduct(null)
    fetchProducts()
    toast({
      title: "Éxito",
      description: editingProduct ? "Producto actualizado correctamente" : "Producto creado correctamente",
    })
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsFormDialogOpen(true)
  }

  const handleEditProduct = (product: ProductWithDetails) => {
    setEditingProduct(product)
    setIsFormDialogOpen(true)
  }

  const handleAssignStock = (product: ProductWithDetails) => {
    setSelectedProductForAssignment(product)
  }

  const handleAssignmentSuccess = () => {
    setSelectedProductForAssignment(null)
    fetchProducts()
    toast({
      title: "Éxito",
      description: "Stock asignado correctamente",
    })
  }

  const handleDialogClose = () => {
    setIsFormDialogOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? "Modifica los datos del producto seleccionado."
                  : "Completa el formulario para agregar un nuevo producto al inventario."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProductForm 
                onFormSubmitSuccess={handleFormSuccess} 
                product={editingProduct}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Existentes</CardTitle>
          <CardDescription>Lista de productos con control de stock y asignación a stands.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner /> 
          ) : (
            <ProductsTable 
              products={products} 
              onAssignStock={handleAssignStock}
              onEdit={handleEditProduct}
              fetchProducts={fetchProducts}
            />
          )}
        </CardContent>
      </Card>

      <StockAssignmentDialog
        product={selectedProductForAssignment}
        isOpen={!!selectedProductForAssignment}
        onOpenChange={(open) => !open && setSelectedProductForAssignment(null)}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  )
}
