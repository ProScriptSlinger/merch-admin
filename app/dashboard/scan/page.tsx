"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  QrCode,
  Package,
  User,
  Calendar,
  CheckCircle,
  X,
  Edit3,
  Scan,
  Mail,
  Hash,
  Clock,
  ShoppingBag,
  DollarSign,
  Shirt,
  AlertCircle,
  PartyPopper,
  XCircle,
  CreditCard,
} from "lucide-react"
import { mockDemoOrders, type OrderItem } from "@/lib/data"
import { EditOrderDialog } from "./edit-order-dialog"
import { OrderGenerator } from "./order-generator"

export default function ScanPage() {
  const [qrCode, setQrCode] = useState("")
  const [scannedOrder, setScannedOrder] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [orderStatus, setOrderStatus] = useState<"pending" | "confirmed" | "cancelled">("pending")
  const [activeTab, setActiveTab] = useState("delivery")

  const handleQRSubmit = () => {
    if (!qrCode.trim()) {
      setMessage("Por favor ingresa un código QR")
      setMessageType("error")
      return
    }

    // Reset previous states
    setScannedOrder(null)

    // Buscar pedido por QR code
    const order = mockDemoOrders.find((o) => o.qrCode === qrCode.trim())
    if (order) {
      setScannedOrder({ ...order })
      setOrderStatus("pending")
      setMessage("✅ Pedido encontrado - Revisa los detalles y selecciona una acción")
      setMessageType("success")
      setActiveTab("delivery")
      return
    }

    // No se encontró nada
    setMessage("❌ Código QR no válido - No se encontró ningún pedido con este código")
    setMessageType("error")
  }

  const handleConfirmDelivery = () => {
    setOrderStatus("confirmed")
    setMessage("🎉 ✅ Entrega registrada con éxito.")
    setMessageType("success")
  }

  const handleCancelDelivery = () => {
    setOrderStatus("cancelled")
    setMessage("❌ Entrega cancelada.")
    setMessageType("error")
  }

  const handleSaveOrderChanges = (updatedItems: OrderItem[]) => {
    if (scannedOrder) {
      setScannedOrder({
        ...scannedOrder,
        items: updatedItems,
      })
      setMessage("✅ Pedido actualizado correctamente")
      setMessageType("success")
    }
  }

  const resetScan = () => {
    setQrCode("")
    setScannedOrder(null)
    setMessage("")
    setOrderStatus("pending")
  }

  const calculateTotal = () => {
    return (
      scannedOrder?.items.reduce((total: number, item: OrderItem) => total + item.unitPrice * item.quantity, 0) || 0
    )
  }

  const getStatusIcon = () => {
    switch (orderStatus) {
      case "confirmed":
        return <PartyPopper className="h-6 w-6 text-green-600" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-orange-600" />
    }
  }

  const getStatusColor = () => {
    switch (orderStatus) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-200 dark:border-orange-800"
    }
  }

  const getStatusText = () => {
    switch (orderStatus) {
      case "confirmed":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Scan className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Sistema QR</h1>
          <p className="text-muted-foreground">Entrega de pedidos y generación de pagos con QR</p>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Entrega de Pedidos
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Generar Pedido
          </TabsTrigger>
        </TabsList>

        {/* Input QR común */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Escanear Código QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">Código QR</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-input"
                  placeholder="Escanea o ingresa el código QR..."
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleQRSubmit()}
                  className="font-mono text-center"
                />
                <Button onClick={handleQRSubmit} disabled={!qrCode.trim()} className="px-8">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear
                </Button>
              </div>
            </div>

            {/* Códigos de prueba */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Códigos QR Demo - Haz clic para probar:
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📦 PEDIDOS (Para Entrega):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mockDemoOrders.map((order) => (
                    <Button
                      key={order.qrCode}
                      variant="outline"
                      size="sm"
                      onClick={() => setQrCode(order.qrCode)}
                      className="flex flex-col h-auto p-3 text-xs border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                    >
                      <code className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.qrCode}</code>
                      <span className="text-muted-foreground mt-1">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">
                        $
                        {order.items
                          .reduce((total, item) => total + item.unitPrice * item.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {message && (
              <Alert
                className={
                  messageType === "error"
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                    : messageType === "success"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                      : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                }
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    messageType === "error"
                      ? "text-red-600 dark:text-red-400"
                      : messageType === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <AlertDescription
                  className={
                    messageType === "error"
                      ? "text-red-800 dark:text-red-200"
                      : messageType === "success"
                        ? "text-green-800 dark:text-green-200"
                        : "text-blue-800 dark:text-blue-200"
                  }
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tab Content */}
        <TabsContent value="delivery" className="space-y-6">
          {/* Detalle del pedido */}
          {scannedOrder && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl">Detalle del Pedido</h2>
                      <p className="text-sm text-muted-foreground font-normal">
                        Información completa de la compra del cliente
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`px-3 py-1 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="ml-2">{getStatusText()}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Info del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Cliente
                    </h3>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scannedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{scannedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">ID: {scannedOrder.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Pedido
                    </h3>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(scannedOrder.orderDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Método de pago:{" "}
                          <Badge variant="outline">{scannedOrder.paymentMethod || "No especificado"}</Badge>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-lg">${calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Productos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Productos ({scannedOrder.items.length} items)
                  </h3>
                  <div className="grid gap-4">
                    {scannedOrder.items.map((item: OrderItem, index: number) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <Shirt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.productName}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="secondary">Talle {item.size}</Badge>
                            <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                            <span className="text-sm font-medium">${item.unitPrice.toLocaleString()} c/u</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Subtotal: ${(item.unitPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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

                {/* Botones de acción */}
                {orderStatus === "pending" && (
                  <>
                    <Separator />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleConfirmDelivery}
                        className="flex-1 h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />✅ Confirmar Entrega
                      </Button>
                      <Button
                        onClick={handleCancelDelivery}
                        variant="destructive"
                        className="flex-1 h-12 text-lg font-semibold"
                      >
                        <X className="h-5 w-5 mr-2" />❌ Cancelar Entrega
                      </Button>
                      <Button
                        onClick={() => setShowEditDialog(true)}
                        variant="outline"
                        className="flex-1 h-12 text-lg font-semibold border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      >
                        <Edit3 className="h-5 w-5 mr-2" />
                        ✏️ Editar Pedido
                      </Button>
                    </div>
                  </>
                )}

                {/* Estado final */}
                {orderStatus !== "pending" && (
                  <>
                    <Separator />
                    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
                      <div className="flex items-center justify-center gap-3">
                        {getStatusIcon()}
                        <span className="text-xl font-semibold">
                          {orderStatus === "confirmed" ? "¡Entrega Completada!" : "Entrega Cancelada"}
                        </span>
                      </div>
                      <p className="text-center mt-2 opacity-80">
                        {orderStatus === "confirmed"
                          ? "El pedido ha sido entregado exitosamente al cliente."
                          : "La entrega del pedido ha sido cancelada."}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!scannedOrder && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Escanea un QR de Pedido</h3>
                <p className="text-muted-foreground">
                  Usa uno de los códigos QR de ejemplo arriba para ver el detalle de un pedido
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <OrderGenerator />
        </TabsContent>
      </Tabs>

      {/* Botón para nuevo escaneo */}
      {scannedOrder && (
        <div className="text-center mt-8">
          <Button onClick={resetScan} variant="outline" size="lg" className="px-8">
            <QrCode className="h-4 w-4 mr-2" />
            Escanear Nuevo QR
          </Button>
        </div>
      )}

      {/* Dialog para editar pedido */}
      <EditOrderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        orderItems={scannedOrder?.items || []}
        onSaveChanges={handleSaveOrderChanges}
      />
    </div>
  )
}
