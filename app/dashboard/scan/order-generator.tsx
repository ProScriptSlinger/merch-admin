"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  QrCode,
  Clock,
  CheckCircle,
  Package,
  Shirt,
  CreditCard,
  Banknote,
  ArrowRightLeft,
} from "lucide-react"
import { mockProducts, getProductPrice, type OrderItem } from "@/lib/data"

// Clientes demo simplificados
const demoCustomers = [
  { id: "1", name: "Juan Pérez", email: "juan@email.com" },
  { id: "2", name: "María García", email: "maria@email.com" },
  { id: "3", name: "Carlos López", email: "carlos@email.com" },
  { id: "4", name: "Ana Martín", email: "ana@email.com" },
]

// Métodos de pago disponibles
const paymentMethods = [
  {
    id: "pos",
    name: "POS (Tarjeta)",
    icon: CreditCard,
    description: "Pago con tarjeta de débito/crédito",
    color: "blue",
    requiresQR: false,
  },
  {
    id: "cash",
    name: "Efectivo",
    icon: Banknote,
    description: "Pago en efectivo",
    color: "green",
    requiresQR: false,
  },
  {
    id: "qr_mp",
    name: "QR Mercado Pago",
    icon: QrCode,
    description: "Pago con QR de Mercado Pago",
    color: "purple",
    requiresQR: true,
  },
  {
    id: "transfer",
    name: "Transferencia",
    icon: ArrowRightLeft,
    description: "Transferencia bancaria",
    color: "orange",
    requiresQR: false,
  },
]

export function OrderGenerator() {
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [showPaymentQR, setShowPaymentQR] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "confirmed" | "failed">("waiting")
  const [generatedQR, setGeneratedQR] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const selectedCustomer = demoCustomers.find((c) => c.id === selectedCustomerId)
  const selectedPayment = paymentMethods.find((p) => p.id === selectedPaymentMethod)

  const addProduct = () => {
    if (!selectedProductId || !selectedSize) return

    const product = mockProducts.find((p) => p.product_id === selectedProductId)
    if (!product) return

    const existingItem = orderItems.find((item) => item.productId === selectedProductId && item.size === selectedSize)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      )
    } else {
      const newItem: OrderItem = {
        id: `item_${Date.now()}`,
        productId: selectedProductId,
        productName: product.name,
        size: selectedSize,
        quantity: quantity,
        unitPrice: getProductPrice(selectedProductId),
      }
      setOrderItems([...orderItems, newItem])
    }

    setSelectedProductId("")
    setSelectedSize("")
    setQuantity(1)
  }

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setOrderItems(orderItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const getAvailableSizes = (productId: string) => {
    const product = mockProducts.find((p) => p.product_id === productId)
    return product?.variants.map((v) => v.size) || []
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  }

  const processPayment = () => {
    if (!selectedCustomer || orderItems.length === 0 || !selectedPayment) return

    setIsProcessingPayment(true)

    if (selectedPayment.requiresQR) {
      // Para QR Mercado Pago, mostrar QR y simular espera
      const qrData = `MP-PAY-${Date.now()}-${selectedCustomer.id}`
      setGeneratedQR(qrData)
      setShowPaymentQR(true)
      setPaymentStatus("waiting")
      setIsProcessingPayment(false)

      // Simular confirmación de pago después de 5 segundos
      setTimeout(() => {
        setPaymentStatus("confirmed")
      }, 5000)
    } else {
      // Para otros métodos, simular procesamiento inmediato
      setTimeout(() => {
        setPaymentStatus("confirmed")
        setIsProcessingPayment(false)
      }, 2000)
    }
  }

  const resetOrder = () => {
    setOrderItems([])
    setSelectedCustomerId("")
    setSelectedPaymentMethod("")
    setShowPaymentQR(false)
    setPaymentStatus("waiting")
    setGeneratedQR("")
    setIsProcessingPayment(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Selección de cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Seleccionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-select">Cliente</Label>
              <select
                id="customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar cliente...</option>
                {demoCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agregar productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Agregar Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Producto</Label>
              <select
                id="product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar producto...</option>
                {mockProducts.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name} - ${getProductPrice(product.product_id).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-select">Talle</Label>
              <select
                id="size-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={!selectedProductId}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar talle...</option>
                {getAvailableSizes(selectedProductId).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity-input">Cantidad</Label>
              <Input
                id="quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Acción</Label>
              <Button onClick={addProduct} disabled={!selectedProductId || !selectedSize} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedido actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              Pedido Actual ({orderItems.length} items)
            </div>
            {orderItems.length > 0 && (
              <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-3 py-1">
                Total: ${calculateTotal().toLocaleString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {orderItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay productos en el pedido</p>
            </div>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700 gap-3 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-muted dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shirt className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{item.productName}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.size}
                          </Badge>
                          <span className="text-xs sm:text-sm">${item.unitPrice.toLocaleString()} c/u</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold text-sm sm:text-base">
                          ${(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Selección de método de pago */}
      {orderItems.length > 0 && selectedCustomer && !showPaymentQR && paymentStatus !== "confirmed" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon
                const isSelected = selectedPaymentMethod === method.id
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? `border-${method.color}-500 bg-${method.color}-50 dark:bg-${method.color}-950/30`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? `bg-${method.color}-100 dark:bg-${method.color}-900`
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            isSelected
                              ? `text-${method.color}-600 dark:text-${method.color}-400`
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{method.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{method.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedPayment && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                    Total a Pagar: ${calculateTotal().toLocaleString()}
                  </div>
                  <p className="text-green-600 dark:text-green-400">
                    Cliente: {selectedCustomer.name} | Método: {selectedPayment.name}
                  </p>
                </div>

                <Button
                  onClick={processPayment}
                  disabled={isProcessingPayment}
                  size="lg"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                >
                  {isProcessingPayment ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <selectedPayment.icon className="h-5 w-5 mr-2" />
                      <span className="truncate">
                        {selectedPayment.requiresQR ? "Generar QR de Pago" : `Procesar Pago ${selectedPayment.name}`}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* QR de pago (solo para Mercado Pago) */}
      {showPaymentQR && selectedPayment?.requiresQR && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <QrCode className="h-6 w-6 text-purple-600" />
              {selectedPayment.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 text-center space-y-6">
            {/* QR Code simulado */}
            <div className="flex justify-center px-4">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white dark:bg-gray-800 border-4 border-purple-200 dark:border-purple-700 rounded-lg flex items-center justify-center">
                <div className="text-center p-2">
                  <QrCode className="h-16 w-16 sm:h-20 sm:w-20 text-purple-600 dark:text-purple-400 mx-auto mb-2 sm:mb-4" />
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 sm:p-2 rounded break-all">
                    {generatedQR}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">QR de Mercado Pago</p>
                </div>
              </div>
            </div>

            {/* Estado del pago */}
            <div className="space-y-4">
              <div className="text-2xl font-bold">${calculateTotal().toLocaleString()}</div>

              {paymentStatus === "waiting" && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span className="font-semibold">Esperando pago...</span>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    El cliente debe escanear el QR con la app de Mercado Pago
                  </p>
                </div>
              )}

              {paymentStatus === "confirmed" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold text-lg">✅ Pago recibido. Pedido confirmado.</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    El pedido ha sido procesado exitosamente con {selectedPayment.name}
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              {paymentStatus === "confirmed" && (
                <Button onClick={resetOrder} className="flex-1 h-12 sm:h-auto" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pedido
                </Button>
              )}
              {paymentStatus === "waiting" && (
                <Button onClick={() => setShowPaymentQR(false)} variant="outline" className="flex-1 h-12 sm:h-auto">
                  Cancelar Pago
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmación para métodos sin QR */}
      {!showPaymentQR && paymentStatus === "confirmed" && selectedPayment && !selectedPayment.requiresQR && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">✅ Pago Confirmado</div>
                <p className="text-green-600 dark:text-green-400 mb-4">
                  Pedido procesado exitosamente con {selectedPayment.name}
                </p>
                <div className="text-lg font-semibold">Total: ${calculateTotal().toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">Cliente: {selectedCustomer?.name}</p>
              </div>

              <Button onClick={resetOrder} size="lg" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
