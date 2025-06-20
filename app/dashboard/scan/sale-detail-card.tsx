"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, User, Calendar, MapPin, Package, CheckCircle, Clock, Mail, Hash, Shirt } from "lucide-react"
import type { Sale, Stand } from "@/lib/types"
import { mockProducts } from "@/lib/data"

interface SaleDetailCardProps {
  sale: Sale
  currentStand: Stand
  onConfirmDelivery: () => void
  isDelivering?: boolean
}

export function SaleDetailCard({ sale, currentStand, onConfirmDelivery, isDelivering = false }: SaleDetailCardProps) {
  const isDelivered = sale.status === "Delivered"

  // Calcular totales
  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0)

  // Obtener información detallada de productos
  const detailedItems = sale.items.map((item) => {
    const product = mockProducts.find((p) => p.product_id === item.productId)
    return {
      ...item,
      product: product,
      imageUrl: product?.image_url || "/placeholder.svg?height=60&width=60",
    }
  })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Detalle de Venta</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Hash className="h-4 w-4 mr-1" />
                ID: {sale.id}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isDelivered ? "default" : "secondary"}
            className={isDelivered ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
          >
            {isDelivered ? "Entregado" : "Pendiente"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información del Cliente */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-600" />
            Información del Cliente
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">{sale.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                Fecha de compra:{" "}
                {new Date(sale.saleDate).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                Tipo de venta: <Badge variant="outline">{sale.saleType}</Badge>
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Productos Comprados */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center">
            <Shirt className="h-5 w-5 mr-2 text-gray-600" />
            Productos ({totalItems} items)
          </h3>
          <div className="space-y-3">
            {detailedItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  {item.product && (
                    <p className="text-sm text-gray-600">Categoría: {item.product.category || "Sin categoría"}</p>
                  )}
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Cantidad: {item.quantity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Información de Entrega */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-600" />
            Información de Entrega
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Stand de entrega: {currentStand.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 ml-6">Ubicación: {currentStand.location}</span>
            </div>

            {isDelivered && sale.deliveryTimestamp && (
              <>
                <div className="flex items-center mt-3 pt-3 border-t">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Entregado el:{" "}
                    {new Date(sale.deliveryTimestamp).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {sale.deliveredByStandId && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 ml-6">Por el stand: {currentStand.name}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Botón de Confirmación */}
        {!isDelivered && (
          <div className="pt-4">
            <Button onClick={onConfirmDelivery} className="w-full h-12 text-lg" disabled={isDelivering}>
              {isDelivering ? (
                <>
                  <Clock className="mr-2 h-5 w-5 animate-spin" />
                  Procesando entrega...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirmar Entrega
                </>
              )}
            </Button>
          </div>
        )}

        {isDelivered && (
          <div className="pt-4">
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">¡Producto ya entregado exitosamente!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
