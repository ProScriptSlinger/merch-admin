"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, QrCode, Copy } from "lucide-react"
import { toast } from "sonner"

interface QRCodeGeneratorProps {
  qrValue?: string
  title?: string
  description?: string
  showInput?: boolean
  onQRGenerated?: (qrValue: string) => void
}

export function QRCodeGenerator({ 
  qrValue = "", 
  title = "Generador de QR", 
  description = "Genera códigos QR para pedidos",
  showInput = true,
  onQRGenerated 
}: QRCodeGeneratorProps) {
  const [inputValue, setInputValue] = useState(qrValue)
  const [generatedQR, setGeneratedQR] = useState(qrValue)

  const handleGenerate = () => {
    if (!inputValue.trim()) {
      toast.error("Por favor ingresa un valor para el código QR")
      return
    }
    
    setGeneratedQR(inputValue.trim())
    onQRGenerated?.(inputValue.trim())
    toast.success("Código QR generado exitosamente")
  }

  const handleDownload = () => {
    if (!generatedQR) {
      toast.error("No hay código QR para descargar")
      return
    }

    const svg = document.querySelector("#qr-code svg") as SVGElement
    if (!svg) {
      toast.error("No se pudo generar la imagen")
      return
    }

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-code-${generatedQR}.png`
      downloadLink.href = pngFile
      downloadLink.click()
      
      toast.success("Código QR descargado exitosamente")
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleCopy = () => {
    if (!generatedQR) {
      toast.error("No hay código QR para copiar")
      return
    }

    navigator.clipboard.writeText(generatedQR)
    toast.success("Código QR copiado al portapapeles")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInput && (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Valor del código QR</Label>
            <div className="flex gap-2">
              <Input
                id="qr-input"
                placeholder="Ej: ORDER-QR-001"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                className="font-mono"
              />
              <Button onClick={handleGenerate} disabled={!inputValue.trim()}>
                Generar
              </Button>
            </div>
          </div>
        )}

        {generatedQR && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div id="qr-code" className="p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  value={generatedQR}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Código QR generado:</Label>
              <div className="p-2 bg-muted rounded font-mono text-sm break-all">
                {generatedQR}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 