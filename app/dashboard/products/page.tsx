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
import { getProducts } from "./actions"
import ProductForm from "./product-form"
import ProductsTable from "./products-table"
import StockAssignmentDialog from "./stock-assignment-dialog"
import type { Product } from "@/lib/types"
import { PlusCircle } from "lucide-react"

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="ml-2 text-muted-foreground">Cargando productos...</p>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedProductForAssignment, setSelectedProductForAssignment] = useState<Product | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error al cargar productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false)
    fetchProducts()
  }

  const handleAssignStock = (product: Product) => {
    setSelectedProductForAssignment(product)
  }

  const handleAssignmentSuccess = () => {
    setSelectedProductForAssignment(null)
    fetchProducts()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Agregar Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa el formulario para agregar un nuevo producto al inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProductForm onFormSubmitSuccess={handleFormSuccess} />
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
          {isLoading ? <LoadingSpinner /> : <ProductsTable products={products} onAssignStock={handleAssignStock} />}
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
