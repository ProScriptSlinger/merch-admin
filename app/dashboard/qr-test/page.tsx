"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrCode, Scan, Download, Copy } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"

export default function QRTestPage() {
  const [selectedQR, setSelectedQR] = useState("")

  const demoQRCodes = [
    { code: "ORDER-QR-001", customer: "Juan Pérez", amount: "$43,000" },
    { code: "ORDER-QR-002", customer: "María García", amount: "$63,500" },
    { code: "ORDER-QR-003", customer: "Carlos López", amount: "$47,500" },
  ]

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Prueba de Códigos QR</h1>
          <p className="text-muted-foreground">Genera y prueba códigos QR para pedidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Generator */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Generador de QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeGenerator
                title="Generar QR Personalizado"
                description="Crea códigos QR para cualquier pedido"
                onQRGenerated={setSelectedQR}
              />
            </CardContent>
          </Card>

          {/* Demo QR Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-green-600" />
                Códigos QR Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estos son los códigos QR de prueba que puedes usar en la página de escaneo:
              </p>
              
              <div className="space-y-3">
                {demoQRCodes.map((qr) => (
                  <div
                    key={qr.code}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedQR(qr.code)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                        <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-sm">{qr.code}</p>
                        <p className="text-xs text-muted-foreground">{qr.customer}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{qr.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-purple-600" />
                Instrucciones de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-bold text-blue-600 dark:text-blue-400">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Generar QR</p>
                    <p className="text-sm text-muted-foreground">
                      Usa el generador para crear códigos QR personalizados o selecciona uno de los códigos demo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 dark:bg-green-900 rounded text-xs font-bold text-green-600 dark:text-green-400">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Descargar o Copiar</p>
                    <p className="text-sm text-muted-foreground">
                      Descarga el código QR como imagen PNG o cópialo al portapapeles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded text-xs font-bold text-purple-600 dark:text-purple-400">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Probar Escaneo</p>
                    <p className="text-sm text-muted-foreground">
                      Ve a la página de escaneo y usa la cámara para escanear el código QR generado.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Códigos QR Demo Disponibles:</h4>
                <div className="space-y-2">
                  {demoQRCodes.map((qr) => (
                    <div key={qr.code} className="flex items-center justify-between text-sm">
                      <code className="font-mono bg-muted px-2 py-1 rounded">{qr.code}</code>
                      <span className="text-muted-foreground">{qr.customer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Consejo
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Puedes usar tu teléfono para mostrar el código QR generado y escanearlo con la cámara de la aplicación.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Selected QR Display */}
          {selectedQR && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-orange-600" />
                  QR Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg border">
                      <QRCodeGenerator
                        qrValue={selectedQR}
                        showInput={false}
                        title=""
                        description=""
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {selectedQR}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigator.clipboard.writeText(selectedQR)}
                      variant="outline" 
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Código
                    </Button>
                    <Button 
                      onClick={() => window.open('/dashboard/scan', '_blank')}
                      className="flex-1"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Ir a Escaneo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 