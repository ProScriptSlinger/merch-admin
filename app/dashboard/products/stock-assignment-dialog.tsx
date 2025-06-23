"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { ProductWithDetails } from "@/lib/services/products"
import { mockStands, getTotalAssignedStock, getTotalRemainingStock } from "@/lib/data"
import { Store, Package, AlertCircle } from "lucide-react"

interface StockAssignmentDialogProps {
  product: ProductWithDetails | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface StandAssignment {
  standId: string
  standName: string
  currentAssigned: number
  newAssignment: number
}

// Adapter function to convert ProductWithDetails to the format expected by helper functions
const adaptProductForHelpers = (product: ProductWithDetails) => ({
  product_id: product.id,
  total_quantity: product.total_quantity,
  name: product.name
})

export default function StockAssignmentDialog({
  product,
  isOpen,
  onOpenChange,
  onSuccess,
}: StockAssignmentDialogProps) {
  const [assignments, setAssignments] = useState<StandAssignment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (product && isOpen) {
      const standAssignments = mockStands.map((stand) => {
        const currentStock = stand.stock.find((s) => s.productId === product.id)
        return {
          standId: stand.id,
          standName: stand.name,
          currentAssigned: currentStock ? currentStock.assignedQuantity : 0,
          newAssignment: 0,
        }
      })
      setAssignments(standAssignments)
    }
  }, [product, isOpen])

  if (!product) return null

  const adaptedProduct = adaptProductForHelpers(product)
  const totalStock = adaptedProduct.total_quantity || 0
  const currentlyAssigned = getTotalAssignedStock(adaptedProduct)
  const availableForAssignment = getTotalRemainingStock(adaptedProduct)
  const newAssignmentTotal = assignments.reduce((sum, a) => sum + a.newAssignment, 0)
  const remainingAfterAssignment = availableForAssignment - newAssignmentTotal

  const handleAssignmentChange = (standId: string, value: string) => {
    const numValue = Math.max(0, Number.parseInt(value) || 0)
    setAssignments((prev) => prev.map((a) => (a.standId === standId ? { ...a, newAssignment: numValue } : a)))
  }

  const handleSubmit = async () => {
    if (newAssignmentTotal > availableForAssignment) {
      toast({
        title: "Error de Asignación",
        description: "No puedes asignar más stock del disponible.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simular la asignación de stock
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aquí actualizarías los datos reales
      assignments.forEach((assignment) => {
        if (assignment.newAssignment > 0) {
          const stand = mockStands.find((s) => s.id === assignment.standId)
          if (stand) {
            const existingStock = stand.stock.find((s) => s.productId === product.id)
            if (existingStock) {
              existingStock.assignedQuantity += assignment.newAssignment
            } else {
              stand.stock.push({
                productId: product.id,
                productName: product.name,
                assignedQuantity: assignment.newAssignment,
                deliveredQuantity: 0,
              })
            }
          }
        }
      })

      toast({
        title: "Stock Asignado",
        description: `Se ha asignado stock de "${product.name}" a los stands seleccionados.`,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al asignar el stock.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasValidAssignments = assignments.some((a) => a.newAssignment > 0)
  const isValidAssignment = newAssignmentTotal <= availableForAssignment && hasValidAssignments

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asignar Stock: {product.name}
          </DialogTitle>
          <DialogDescription>Distribuye el stock disponible entre los diferentes stands del evento.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Información del Producto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Resumen de Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock Total:</span>
                <Badge variant="outline">{totalStock}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ya Asignado:</span>
                <Badge variant="secondary">{currentlyAssigned}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disponible:</span>
                <Badge variant="default" className="bg-green-600">
                  {availableForAssignment}
                </Badge>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nueva Asignación:</span>
                <Badge variant={newAssignmentTotal > availableForAssignment ? "destructive" : "default"}>
                  {newAssignmentTotal}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Restante:</span>
                <Badge variant={remainingAfterAssignment < 0 ? "destructive" : "outline"}>
                  {remainingAfterAssignment}
                </Badge>
              </div>

              {remainingAfterAssignment < 0 && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Excede stock disponible</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asignaciones por Stand */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Asignación por Stand
                </CardTitle>
                <CardDescription>Especifica cuánto stock asignar a cada stand.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.standId}
                        className="grid grid-cols-3 items-center gap-4 p-3 border rounded-lg"
                      >
                        <div>
                          <Label className="font-medium">{assignment.standName}</Label>
                          <p className="text-xs text-muted-foreground">Actual: {assignment.currentAssigned} unidades</p>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`assignment-${assignment.standId}`} className="text-xs">
                            Asignar
                          </Label>
                          <Input
                            id={`assignment-${assignment.standId}`}
                            type="number"
                            min="0"
                            max={availableForAssignment}
                            value={assignment.newAssignment}
                            onChange={(e) => handleAssignmentChange(assignment.standId, e.target.value)}
                            className="text-center"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Total: {assignment.currentAssigned + assignment.newAssignment}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.newAssignment > 0 && `+${assignment.newAssignment}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidAssignment || isSubmitting}>
            {isSubmitting ? "Asignando..." : "Asignar Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
