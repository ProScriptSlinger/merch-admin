"use client"
import { useState, useEffect, useRef } from "react"
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QrCode, VideoOff, Video, CheckCircle, XCircle, ShoppingCart, User } from "lucide-react"
import { mockStands, mockSales } from "@/lib/data" // Added mockSales
import type { Stand, Sale } from "@/lib/types" // Added Sale
import { useToast } from "@/hooks/use-toast"
// Removed Select and Input as product selection is now tied to the sale

const QR_READER_ELEMENT_ID = "qr-reader"

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannerState, setScannerState] = useState<"idle" | "scanning" | "paused">("idle")
  const [identifiedSale, setIdentifiedSale] = useState<Sale | null>(null)
  const [currentStand, setCurrentStand] = useState<Stand | null>(mockStands[0] || null) // Assume a stand context, e.g., the first stand for demo

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scannerState === "idle" && !html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(QR_READER_ELEMENT_ID)
    }
    return () => {
      stopScan()
    }
  }, [])

  const startScan = async () => {
    setError(null)
    setScanResult(null)
    setIdentifiedSale(null)

    if (html5QrCodeRef.current && html5QrCodeRef.current.getState() !== Html5QrcodeScannerState.SCANNING) {
      try {
        const cameras = await Html5Qrcode.getCameras()
        if (cameras && cameras.length) {
          setScannerState("scanning")
          html5QrCodeRef.current
            .start(
              cameras[0].id,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText, _decodedResult) => {
                setScanResult(decodedText)
                handleSuccessfulScan(decodedText)
                stopScan(false)
              },
              (_errorMessage) => {
                /* setError(`QR Code scan error: ${errorMessage}`); */
              },
            )
            .catch((err) => {
              setError(`Failed to start scanner: ${err.message}`)
              setScannerState("idle")
            })
        } else {
          setError("No cameras found.")
          setScannerState("idle")
        }
      } catch (err: any) {
        setError(`Camera permission error or no cameras: ${err.message}`)
        setScannerState("idle")
      }
    }
  }

  const stopScan = (clearInstance = true) => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setScannerState("paused")
        })
        .catch((err) => {
          console.error("Failed to stop scanner:", err)
        })
    }
    if (scannerState !== "paused") setScannerState("idle")
  }

  const handleSuccessfulScan = (qrData: string) => {
    // Try to find a sale matching the QR data
    const sale = mockSales.find((s) => s.deliveryQrValue === qrData)
    if (sale) {
      if (sale.status === "Delivered") {
        setIdentifiedSale(sale)
        setError(`This order (ID: ${sale.id}) has already been delivered.`)
        toast({
          title: "Order Already Delivered",
          description: `Sale ID ${sale.id} for ${sale.email} was already marked as delivered.`,
          variant: "destructive",
        })
      } else {
        setIdentifiedSale(sale)
        setError(null)
      }
    } else {
      setIdentifiedSale(null)
      setError("Invalid Sale QR Code. This QR does not match any pending online orders.")
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not associated with any pending sales.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDelivery = () => {
    if (!identifiedSale || !currentStand) {
      toast({ title: "Error", description: "No sale identified or current stand not set.", variant: "destructive" })
      return
    }
    if (identifiedSale.status === "Delivered") {
      toast({ title: "Error", description: "This sale has already been delivered.", variant: "destructive" })
      return
    }

    // Simulate delivery: Update sale status in mockSales
    // In a real app, this would be a server action.
    const saleIndex = mockSales.findIndex((s) => s.id === identifiedSale.id)
    if (saleIndex !== -1) {
      mockSales[saleIndex].status = "Delivered"
      mockSales[saleIndex].deliveredByStandId = currentStand.id
      mockSales[saleIndex].deliveryTimestamp = new Date().toISOString()
    }
    // Also, update stock at the delivering stand (this part is complex with shared mock data)
    // For each item in identifiedSale.items, decrement stock from currentStand.stock
    // This requires finding the product in currentStand.stock and decrementing deliveredQuantity.
    // This part is simplified here and should be robustly handled in a real backend.

    toast({
      title: "Delivery Successful!",
      description: `Order ${identifiedSale.id} for ${identifiedSale.email} marked as delivered by ${currentStand.name}.`,
    })

    // Reset for next scan
    setScanResult(null)
    setIdentifiedSale(null)
    setScannerState("idle")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Escanear QR de Venta</h1>
      <p className="text-muted-foreground mb-8">
        Stand actual: <strong>{currentStand?.name || "No definido"}</strong> (Las entregas se registrarán para este
        stand)
      </p>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Escáner de Código QR</CardTitle>
          <CardDescription>
            {scannerState === "scanning"
              ? "Apunta la cámara al código QR de la venta del cliente."
              : "Haz clic en 'Iniciar Escaneo' para activar la cámara."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            id={QR_READER_ELEMENT_ID}
            className="w-full h-auto aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center"
          >
            {scannerState !== "scanning" && <QrCode className="w-24 h-24 text-muted-foreground" />}
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {scannerState !== "scanning" ? (
              <Button onClick={startScan} className="w-full" disabled={scannerState === "scanning"}>
                <Video className="mr-2 h-4 w-4" /> Iniciar Escaneo
              </Button>
            ) : (
              <Button
                onClick={() => stopScan()}
                variant="outline"
                className="w-full"
                disabled={scannerState === "idle" || scannerState === "paused"}
              >
                <VideoOff className="mr-2 h-4 w-4" /> Detener Escaneo
              </Button>
            )}
          </div>

          {identifiedSale && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
                  Venta Identificada: {identifiedSale.id}
                </CardTitle>
                <CardDescription className="flex items-center">
                  <User className="mr-1 h-4 w-4 text-muted-foreground" /> {identifiedSale.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">Items en la venta:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {identifiedSale.items.map((item) => (
                    <li key={item.productId}>
                      {item.productName} (x{item.quantity})
                    </li>
                  ))}
                </ul>
                <p className="font-medium">
                  Estado Actual:{" "}
                  {identifiedSale.status === "Delivered" ? (
                    <span className="text-green-600">Entregada</span>
                  ) : (
                    <span className="text-orange-500">Pendiente de Entrega</span>
                  )}
                </p>
                {identifiedSale.status === "Delivered" && identifiedSale.deliveryTimestamp && (
                  <p className="text-sm text-muted-foreground">
                    Entregado el: {new Date(identifiedSale.deliveryTimestamp).toLocaleString()} por{" "}
                    {mockStands.find((s) => s.id === identifiedSale.deliveredByStandId)?.name || "N/A"}
                  </p>
                )}

                {identifiedSale.status === "Pending" && (
                  <Button onClick={handleConfirmDelivery} className="w-full mt-4">
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Entrega
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
