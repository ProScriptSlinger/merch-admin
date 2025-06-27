"use client"

import { useState, useRef, useEffect } from "react"
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
  Camera,
  CameraOff,
} from "lucide-react"
import QrReader from "react-qr-reader-es6"
import { getOrderByQRCode, updateOrder, type OrderWithDetails } from "@/lib/services/orders"
import { EditOrderDialog } from "./edit-order-dialog"
import { OrderGenerator } from "./order-generator"
import Image from "next/image"
import { useApp } from "@/contexts/AppContext"

export default function ScanPage() {
  const [qrCode, setQrCode] = useState("")
  const [scannedOrder, setScannedOrder] = useState<OrderWithDetails | null>(null)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered" | "cancelled" | "waiting_payment">("pending")
  const [activeTab, setActiveTab] = useState("delivery")
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { orders, fetchOrders } = useApp()


  const handleQRSubmit = async (codeToProcess?: string) => {
    const code = codeToProcess || qrCode

    if (!code.trim()) {
      setMessage("Por favor ingresa un código QR")
      setMessageType("error")
      return
    }

    // Reset previous states
    setScannedOrder(null)
    setIsLoading(true)

    try {
      // Buscar pedido por QR code en Supabase
      const order = await getOrderByQRCode(code.trim())

      if (order) {
        setScannedOrder(order)
        setOrderStatus(order.status as "pending" | "delivered" | "cancelled")
        setMessage("✅ Pedido encontrado - Revisa los detalles y selecciona una acción")
        setMessageType("success")
        setActiveTab("delivery")
        return
      }

      // No se encontró nada
      setMessage("❌ Código QR no válido - No se encontró ningún pedido con este código")
      setMessageType("error")
    } catch (error) {
      console.error("Error fetching order:", error)
      setMessage("❌ Error al buscar el pedido - Intenta nuevamente")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!scannedOrder) return

    setIsLoading(true)
    try {
      // Update order status in Supabase
      await updateOrder(scannedOrder.id, {
        status: "delivered",
        delivery_timestamp: new Date().toISOString(),
      })

      fetchOrders()

      setOrderStatus("delivered")
      setMessage("🎉 ✅ Entrega registrada con éxito.")
      setMessageType("success")
    } catch (error) {
      console.error("Error updating order:", error)
      setMessage("❌ Error al confirmar la entrega - Intenta nuevamente")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelDelivery = async () => {
    if (!scannedOrder) return

    setIsLoading(true)
    try {
      // Update order status in Supabase
      await updateOrder(scannedOrder.id, {
        status: "cancelled",
      })

      setOrderStatus("cancelled")
      setMessage("❌ Entrega cancelada.")
      setMessageType("error")
    } catch (error) {
      console.error("Error cancelling order:", error)
      setMessage("❌ Error al cancelar la entrega - Intenta nuevamente")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOrderChanges = (updatedItems: any[]) => {
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
    setIsScanning(false)
  }

  const calculateTotal = () => {
    return (
      scannedOrder?.items.reduce((total: number, item: any) => total + item.unit_price * item.quantity, 0) || 0
    )
  }

  const getStatusIcon = () => {
    switch (orderStatus) {
      case "delivered":
        return <PartyPopper className="h-6 w-6 text-green-600" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-orange-600" />
    }
  }

  const getStatusColor = () => {
    switch (orderStatus) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-200 dark:border-orange-800"
    }
  }

  const getStatusText = () => {
    switch (orderStatus) {
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  const handleQRScan = (result: any) => {
    if (result) {
      setQrCode(result)
      handleQRSubmit(result)
      setIsScanning(false)
    }
  }

  const handleScanError = (error: any) => {
    console.error("QR Scan error:", error)

    // Provide more specific error messages based on the error type
    let errorMessage = "Error al escanear el código QR."

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = "Acceso a la cámara denegado. Por favor, permite el acceso a la cámara en tu navegador."
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = "No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara disponible."
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = "La cámara está siendo utilizada por otra aplicación. Cierra otras aplicaciones que usen la cámara."
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      errorMessage = "La cámara no cumple con los requisitos. Intenta con una cámara diferente."
    } else if (error.name === 'NotSupportedError') {
      errorMessage = "Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari."
    } else if (error.message && error.message.includes('getUserMedia')) {
      errorMessage = "Error al acceder a la cámara. Verifica los permisos del navegador."
    }

    setScannerError(errorMessage)
  }

  const checkCameraPermission = async () => {
    try {
      // First check if the device has any video input devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      if (videoDevices.length === 0) {
        console.log("No video devices found on this device")
        return { hasPermission: false, error: "No camera found on this device" }
      }

      console.log(`Found ${videoDevices.length} video device(s):`, videoDevices.map(d => d.label || d.deviceId))

      // Try to get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop())

      return { hasPermission: true, error: null }
    } catch (error: any) {
      console.error("Camera permission check failed:", error)

      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        return { hasPermission: false, error: "No camera found on this device" }
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return { hasPermission: false, error: "Camera access denied by user" }
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        return { hasPermission: false, error: "Camera is being used by another application" }
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        return { hasPermission: false, error: "Camera doesn't meet requirements" }
      } else if (error.name === 'NotSupportedError') {
        return { hasPermission: false, error: "Camera not supported in this browser" }
      } else {
        return { hasPermission: false, error: "Unknown camera error" }
      }
    }
  }

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isDesktop = !isMobile

    return {
      isMobile,
      isDesktop,
      userAgent: userAgent.substring(0, 100) + "...",
      platform: navigator.platform,
      vendor: navigator.vendor
    }
  }

  const handleStartScanning = async () => {
    setScannerError("") // Clear previous errors

    // Show loading message
    setMessage("🔄 Iniciando cámara... Por favor, permite el acceso cuando el navegador lo solicite.")
    setMessageType("info")

    // Check camera permission first
    const { hasPermission, error } = await checkCameraPermission()
    if (!hasPermission) {
      const deviceInfo = getDeviceInfo()
      let detailedError = error || "Se requiere permiso para acceder a la cámara."

      if (error?.includes("No camera found")) {
        detailedError = `No se encontró cámara en este dispositivo (${deviceInfo.platform}). Puedes ingresar el código QR manualmente.`
      }

      setScannerError(detailedError)
      setMessage("")
      return
    }

    setIsScanning(true)
    setMessage("✅ Cámara iniciada correctamente. Apunta hacia el código QR.")
    setMessageType("success")

    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage("")
    }, 3000)
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


        {/* Tab Content */}
        <TabsContent value="delivery" className="space-y-6">
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
                  <Button
                    onClick={() => handleQRSubmit()}
                    disabled={!qrCode.trim() || isLoading}
                    className="px-6"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {isLoading ? "Buscando..." : "Buscar"}
                  </Button>
                  <Button
                    onClick={() => isScanning ? setIsScanning(false) : handleStartScanning()}
                    variant={isScanning ? "destructive" : "secondary"}
                    className="px-6"
                  >
                    {isScanning ? (
                      <>
                        <CameraOff className="h-4 w-4 mr-2" />
                        Detener
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Cámara
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Si no tienes cámara, puedes ingresar el código QR manualmente en el campo de texto.
                </p>
              </div>

              {/* Camera View */}
              {isScanning && (
                <div className="space-y-4 ">
                  <div className="flex justify-center">
                    <div className="relative bg-black rounded-lg overflow-hidden w-[400px] h-[400px] text-center">
                      <QrReader
                        onScan={handleQRScan}
                        onError={handleScanError}
                        className="w-[400px] h-[400px] object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="text-white text-center">
                          <QrCode className="h-12 w-12 mx-auto mb-2 opacity-75" />
                          <p className="text-sm opacity-75">Apunta la cámara hacia el código QR</p>
                        </div>
                      </div>
                      {/* Scanning animation overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      📱 Posiciona el código QR dentro del marco para escanearlo automáticamente
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Consejos:</strong> Asegúrate de que la cámara esté bien iluminada y el código QR esté limpio y visible.
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        🌐 <strong>Compatibilidad:</strong> Funciona mejor en Chrome, Firefox y Safari. Asegúrate de usar HTTPS en producción.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanner Error */}
              {scannerError && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {scannerError}
                    {scannerError.includes("No camera found") && (
                      <div className="mt-2 text-sm">
                        💡 <strong>Alternativa:</strong> Puedes ingresar el código QR manualmente en el campo de texto arriba.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Códigos de prueba */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Códigos QR - Haz clic para probar:
                  </p>
                </div>

                <div className="h-[60vh] overflow-scroll">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    📦 PEDIDOS (Para Entrega):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {orders.map((order) => (
                      <Button
                        key={order.qr_code}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQrCode(order.qr_code || "")
                          handleQRSubmit(order.qr_code || "")
                        }}
                        className="flex flex-col h-auto p-3 text-xs border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      >
                        <code className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.qr_code}</code>
                        <div className="flex items-center gap-2">
                          <Badge variant={'outline'} className={`text-muted-foreground mt-1 ${order.status === "delivered" ? "text-green-600" :
                              order.status === "cancelled" ? "text-red-600" :
                                order.status === "waiting_payment" ? "text-yellow-600" :
                                  order.status === "pending" || order.status === "returned" ? "text-yellow-600" :
                                    "text-blue-600"
                            }`}>{order.status === "waiting_payment" ? "Pendiente de Pago" : order.status}</Badge>
                          <Badge variant={'outline'} className={`text-muted-foreground mt-1 ${order.payment_method === "card" ? "text-green-600" :
                              "text-blue-600"
                            }`}>{order.payment_method === "card" ? "Pago con Tarjeta" : order.payment_method}</Badge>
                        </div>

                        <span className="text-muted-foreground mt-1">Stand: {order.stand?.name}</span>
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
                    className={`h-4 w-4 ${messageType === "error"
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
                        <span className="font-medium">{scannedOrder.customer_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{scannedOrder.customer_email}</span>
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
                        <span className="text-sm">{new Date(scannedOrder.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Método de pago:{" "}
                          <Badge variant="outline">{scannedOrder.payment_method || "No especificado"}</Badge>
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
                    {scannedOrder.items.map((item: any, index: number) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          {item?.product_variant?.product?.images && item.product_variant.product.images.length > 0 ? (
                            <Image
                              src={item.product_variant.product.images[0].image_url}
                              alt={item.product_variant.product.name}
                              width={64}
                              height={64}
                              className="object-cover rounded"
                            />
                          ) : (
                            <Shirt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.product_variant.product.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="secondary">Talle {item.product_variant.size}</Badge>
                            <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                            <span className="text-sm font-medium">${item.unit_price.toLocaleString()} c/u</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Subtotal: ${(item.unit_price * item.quantity).toLocaleString()}
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
                {orderStatus === "waiting_payment" && scannedOrder.payment_method == "cash" && (
                  <>
                    <Separator />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => updateOrder(scannedOrder.id, {status: 'pending'})}
                        disabled={isLoading}
                        className="flex-1 h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {isLoading ? "Procesando..." : "✅ Confirmar pago en efectivo"}
                      </Button>
                    </div>
                  </>
                )}


                {/* Botones de acción */}
                {orderStatus === "pending" && (
                  <>
                    <Separator />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleConfirmDelivery}
                        disabled={isLoading}
                        className="flex-1 h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {isLoading ? "Procesando..." : "✅ Confirmar Entrega"}
                      </Button>
                      <Button
                        onClick={handleCancelDelivery}
                        disabled={isLoading}
                        variant="destructive"
                        className="flex-1 h-12 text-lg font-semibold"
                      >
                        <X className="h-5 w-5 mr-2" />
                        {isLoading ? "Procesando..." : "❌ Cancelar Entrega"}
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
                {(orderStatus !== "pending") && (
                  <>
                    <Separator />
                    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
                      <div className="flex items-center justify-center gap-3">
                        {getStatusIcon()}
                        <span className="text-xl font-semibold">
                          {orderStatus === "delivered" ? "¡Entrega Completada!" : orderStatus === "waiting_payment" ? "Procesando el pedido" : "Entrega Cancelada"}
                        </span>
                      </div>
                      <p className="text-center mt-2 opacity-80">
                        {orderStatus === "delivered"
                          ? "El pedido ha sido entregado exitosamente al cliente."
                          : orderStatus === "waiting_payment"
                            ? "El cliente no completó el pago"
                            : "La entrega del pedido ha sido cancelada."}
                      </p>
                      <p className="text-center mt-2 opacity-80">
                        {orderStatus === "waiting_payment" && scannedOrder.payment_method == "card"&&
                          (
                            <a href={scannedOrder?.transaction[0]?.payment_url} target="_blank">
                              <Button>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pagar con Tarjeta
                              </Button>
                            </a>
                          )
                        }
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
                <p className="text-muted-foreground">Usa la cámara para escanear o ingresa manualmente el código QR</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <OrderGenerator />
        </TabsContent>
      </Tabs>



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
