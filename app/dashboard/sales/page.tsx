"use client"

import { Label } from "@/components/ui/label"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { mockSales, mockProducts, mockStands } from "@/lib/data"
import type { Sale } from "@/lib/types"
import { Download, Filter, MoreHorizontal, CheckCircle, Clock, ShoppingBag, Mail } from "lucide-react"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(JSON.parse(JSON.stringify(mockSales))) // Deep copy for mutation
  const [filters, setFilters] = useState({
    email: "",
    productId: "all",
    standId: "all", // Can be POS stand or delivery stand
    saleType: "all" as "all" | "POS" | "Online",
    status: "all" as "all" | "Pending" | "Delivered",
    dateFrom: "",
    dateTo: "",
  })
  const [viewingSaleDetails, setViewingSaleDetails] = useState<Sale | null>(null)
  const [confirmingDeliverySale, setConfirmingDeliverySale] = useState<Sale | null>(null)

  const { toast } = useToast()

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate)
      if (filters.email && !sale.email.toLowerCase().includes(filters.email.toLowerCase())) return false
      if (filters.productId !== "all" && !sale.items.some((item) => item.productId === filters.productId)) return false
      if (filters.standId !== "all" && sale.standId !== filters.standId && sale.deliveredByStandId !== filters.standId)
        return false
      if (filters.saleType !== "all" && sale.saleType !== filters.saleType) return false
      if (filters.status !== "all" && sale.status !== filters.status) return false
      if (filters.dateFrom && saleDate < new Date(filters.dateFrom)) return false
      if (filters.dateTo && saleDate > new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999))) return false
      return true
    })
  }, [sales, filters])

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const handleMarkAsDelivered = (saleId: string) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              status: "Delivered",
              deliveryTimestamp: new Date().toISOString(),
              // Potentially set deliveredByStandId if a "current stand" context exists, or leave null for manual override
            }
          : sale,
      ),
    )
    toast({
      title: "Sale Marked as Delivered",
      description: `Sale ID ${saleId} has been updated.`,
    })
    setConfirmingDeliverySale(null)
  }

  const exportToCSV = () => {
    const headers = [
      "Sale ID",
      "Email",
      "Products",
      "Total Quantity",
      "Sale Date",
      "Sale Type",
      "Status",
      "POS Stand",
      "Delivery QR",
      "Delivered By Stand",
      "Delivery Timestamp",
    ]
    const rows = filteredSales.map((s) => [
      s.id,
      s.email,
      s.items.map((item) => `${item.productName} (x${item.quantity})`).join("; "),
      s.items.reduce((sum, item) => sum + item.quantity, 0),
      new Date(s.saleDate).toLocaleString(),
      s.saleType,
      s.status,
      mockStands.find((stand) => stand.id === s.standId)?.name || "N/A",
      s.deliveryQrValue || "N/A",
      mockStands.find((stand) => stand.id === s.deliveredByStandId)?.name || "N/A",
      s.deliveryTimestamp ? new Date(s.deliveryTimestamp).toLocaleString() : "N/A",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sales_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gestión de Ventas</h1>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="email-filter">Email Cliente</Label>
            <Input
              id="email-filter"
              type="email"
              placeholder="customer@example.com"
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="product-filter">Producto</Label>
            <Select value={filters.productId} onValueChange={(value) => handleFilterChange("productId", value)}>
              <SelectTrigger id="product-filter">
                <SelectValue placeholder="Todos los Productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Productos</SelectItem>
                {mockProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="stand-filter">Stand (POS/Entrega)</Label>
            <Select value={filters.standId} onValueChange={(value) => handleFilterChange("standId", value)}>
              <SelectTrigger id="stand-filter">
                <SelectValue placeholder="Todos los Stands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Stands</SelectItem>
                {mockStands.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="saletype-filter">Tipo de Venta</Label>
            <Select
              value={filters.saleType}
              onValueChange={(value) => handleFilterChange("saleType", value as "all" | "POS" | "Online")}
            >
              <SelectTrigger id="saletype-filter">
                <SelectValue placeholder="Todos los Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="POS">Punto de Venta (POS)</SelectItem>
                <SelectItem value="Online">Tienda Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status-filter">Estado de Entrega</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value as "all" | "Pending" | "Delivered")}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="Pending">Pendiente</SelectItem>
                <SelectItem value="Delivered">Entregada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date-from-filter">Desde</Label>
              <Input
                id="date-from-filter"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to-filter">Hasta</Label>
              <Input
                id="date-to-filter"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Registradas</CardTitle>
          <CardDescription>Mostrando {filteredSales.length} ventas según los filtros aplicados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Fecha Venta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Stand (POS/Entrega)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {sale.email}
                  </TableCell>
                  <TableCell>
                    {sale.items.length === 1
                      ? `${sale.items[0].productName} (x${sale.items[0].quantity})`
                      : `${sale.items.length} items`}
                  </TableCell>
                  <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={sale.saleType === "Online" ? "secondary" : "outline"}>
                      <ShoppingBag className="mr-1 h-3 w-3" />
                      {sale.saleType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sale.status === "Delivered" ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" /> Entregada
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="mr-1 h-3 w-3" /> Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {mockStands.find((s) => s.id === (sale.deliveredByStandId || sale.standId))?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setViewingSaleDetails(sale)}>Ver Detalles</DropdownMenuItem>
                        {sale.status === "Pending" && (
                          <DropdownMenuItem onClick={() => setConfirmingDeliverySale(sale)}>
                            Marcar como Entregada
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron ventas con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Total de ventas mostradas: <strong>{filteredSales.length}</strong>
          </div>
        </CardFooter>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={!!viewingSaleDetails} onOpenChange={(open) => !open && setViewingSaleDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta - {viewingSaleDetails?.id}</DialogTitle>
            <DialogDescription>
              Email: {viewingSaleDetails?.email} | Tipo: {viewingSaleDetails?.saleType} | Estado:{" "}
              {viewingSaleDetails?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <h4 className="font-semibold">Items:</h4>
            {viewingSaleDetails?.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.productName} (ID: {item.productId})
                </span>
                <span>x {item.quantity}</span>
              </div>
            ))}
            <hr className="my-2" />
            <p>
              <strong>Fecha Venta:</strong>{" "}
              {viewingSaleDetails?.saleDate ? new Date(viewingSaleDetails.saleDate).toLocaleString() : "N/A"}
            </p>
            {viewingSaleDetails?.standId && (
              <p>
                <strong>Stand (POS):</strong>{" "}
                {mockStands.find((s) => s.id === viewingSaleDetails.standId)?.name || "N/A"}
              </p>
            )}
            {viewingSaleDetails?.deliveryQrValue && (
              <p>
                <strong>QR de Entrega:</strong> {viewingSaleDetails.deliveryQrValue}
              </p>
            )}
            {viewingSaleDetails?.deliveredByStandId && (
              <p>
                <strong>Entregado por Stand:</strong>{" "}
                {mockStands.find((s) => s.id === viewingSaleDetails.deliveredByStandId)?.name || "N/A"}
              </p>
            )}
            {viewingSaleDetails?.deliveryTimestamp && (
              <p>
                <strong>Fecha Entrega:</strong> {new Date(viewingSaleDetails.deliveryTimestamp).toLocaleString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingSaleDetails(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delivery Dialog */}
      <Dialog open={!!confirmingDeliverySale} onOpenChange={(open) => !open && setConfirmingDeliverySale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Entrega Manual</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres marcar la venta <strong>{confirmingDeliverySale?.id}</strong> para{" "}
              <strong>{confirmingDeliverySale?.email}</strong> como ENTREGADA? Esta acción no se puede deshacer
              fácilmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingDeliverySale(null)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => confirmingDeliverySale && handleMarkAsDelivered(confirmingDeliverySale.id)}
            >
              Sí, Marcar como Entregada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
