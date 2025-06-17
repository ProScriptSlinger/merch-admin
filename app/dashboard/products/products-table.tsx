"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Users } from "lucide-react"
import type { Product } from "@/lib/types"
import { deleteProduct } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { getTotalAssignedStock, getTotalRemainingStock } from "@/lib/data"

interface ProductsTableProps {
  products: Product[]
  onAssignStock: (product: Product) => void
}

export default function ProductsTable({ products, onAssignStock }: ProductsTableProps) {
  const { toast } = useToast()

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const result = await deleteProduct(productId)
    if (result.success) {
      toast({ title: "Éxito", description: result.message })
      // La revalidación en la acción debería actualizar la lista
      window.location.reload() // Forzar recarga para ver cambios
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  if (!products || products.length === 0) {
    return <p className="text-muted-foreground py-4 text-center">No se encontraron productos.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[80px] sm:table-cell">Imagen</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Tallas y Stock</TableHead>
          <TableHead className="text-center">Stock Total</TableHead>
          <TableHead className="text-center">Asignado</TableHead>
          <TableHead className="text-center">Disponible</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const totalStock = product.variants.reduce((sum, v) => sum + v.quantity, 0)
          const assignedStock = getTotalAssignedStock(product)
          const availableStock = getTotalRemainingStock(product)
          const isLowStock = product.low_stock_threshold !== null && totalStock <= product.low_stock_threshold

          const availableVariants = product.variants.filter((v) => v.quantity > 0)

          return (
            <TableRow key={product.product_id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt={product.name}
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={
                    product.image_url || `/placeholder.svg?width=64&height=64&query=${encodeURIComponent(product.name)}`
                  }
                  width="64"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category || "N/A"}</TableCell>
              <TableCell>
                {availableVariants.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {availableVariants.map((v) => (
                      <Badge key={v.size} variant="outline" className="text-xs">
                        {v.size}: {v.quantity}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin stock</span>
                )}
              </TableCell>
              <TableCell className="text-center font-mono">{totalStock}</TableCell>
              <TableCell className="text-center font-mono text-blue-600">{assignedStock}</TableCell>
              <TableCell className="text-center font-mono text-green-600">{availableStock}</TableCell>
              <TableCell>
                {totalStock === 0 ? (
                  <Badge variant="destructive">Sin Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="destructive">Stock Bajo</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    En Stock
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAssignStock(product)}
                    title="Asignar Stock a Stands"
                    disabled={availableStock === 0}
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="sr-only">Asignar stock de {product.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.product_id, product.name)}
                    title="Eliminar Producto"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Eliminar {product.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
