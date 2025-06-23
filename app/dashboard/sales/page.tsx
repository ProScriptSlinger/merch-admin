"use client"

import { Label } from "@/components/ui/label"
import Link from "next/link"

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
import type { Sale, PaymentMethod } from "@/lib/types"
import { EditOrderDialog } from "../scan/edit-order-dialog"
import {
  Download,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  ShoppingBag,
  Mail,
  DollarSign,
  Package,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRightLeft,
  AlertCircle,
  Check,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(JSON.parse(JSON.stringify(mockSales))) // Deep copy for mutation
  const [filters, setFilters] = useState({
    email: "",
    productId: "all",
    standId: "all", // Can be POS stand or delivery stand
    saleType: "all" as "all" | "POS" | "Online",
    status: "all" as "all" | "Pending" | "Delivered",
    paymentMethod: "all" as "all" | PaymentMethod,
    paymentValidated: "all" as "all" | "validated" | "pending",
    dateFrom: "",
    dateTo: "",
  })
  const [viewingSaleDetails, setViewingSaleDetails] = useState<Sale | null>(null)
  const [confirmingDeliverySale, setConfirmingDeliverySale] = useState<Sale | null>(null)
  const [validatingPaymentSale, setValidatingPaymentSale] = useState<Sale | null>(null)
  const [returningOrderSale, setReturningOrderSale] = useState<Sale | null>(null)
  const [editingOrderSale, setEditingOrderSale] = useState<Sale | null>(null)
  const [cancellingOrderSale, setCancellingOrderSale] = useState<Sale | null>(null)
  const [returnReason, setReturnReason] = useState("")

  const { toast } = useToast()

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = sales.reduce((sum, sale) => sum + (sale.status !== "Returned" ? sale.totalAmount || 0 : 0), 0)
    const totalProducts = sales.reduce(
      (sum, sale) =>
        sum + (sale.status !== "Returned" ? sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0),
      0,
    )
    const validatedSales = sales.filter((sale) => sale.paymentValidated && sale.status !== "Returned").length
    const pendingValidation = sales.filter((sale) => !sale.paymentValidated && sale.status !== "Returned").length
    const returnedSales = sales.filter((sale) => sale.status === "Returned").length
    const cashOrdersPending = sales.filter((sale) => sale.paymentMethod === "Efectivo" && !sale.paymentValidated).length

    return {
      totalSales,
      totalProducts,
      validatedSales,
      pendingValidation,
      returnedSales,
      cashOrdersPending,
      totalSalesCount: sales.filter((sale) => sale.status !== "Returned").length,
    }
  }, [sales])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate)
      if (filters.email && !sale.email.toLowerCase().includes(filters.email.toLowerCase())) return false
      if (filters.productId !== "all" && !sale.items.some((item) => item.productId === filters.productId)) return false
      if (filters.standId !== "all" && sale.standId !== filters.standId && sale.deliveredByStandId !== filters.standId)
        return false
      if (filters.saleType !== "all" && sale.saleType !== filters.saleType) return false
      if (filters.status !== "all" && sale.status !== filters.status) return false
      if (filters.paymentMethod !== "all" && sale.paymentMethod !== filters.paymentMethod) return false
      if (filters.paymentValidated === "validated" && !sale.paymentValidated) return false
      if (filters.paymentValidated === "pending" && sale.paymentValidated) return false
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

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(undefined)

  const handleValidatePayment = (saleId: string, newPaymentMethod?: PaymentMethod) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              paymentValidated: true,
              paymentMethod: newPaymentMethod || sale.paymentMethod,
            }
          : sale,
      ),
    )
    toast({
      title: "Pago Validado",
      description: `El pago de la venta ${saleId} ha sido validado correctamente con método: ${newPaymentMethod || "original"}.`,
    })
    setValidatingPaymentSale(null)
    setSelectedPaymentMethod(undefined)
  }

  const handleReturnOrder = (saleId: string, reason: string) => {
    const sale = sales.find((s) => s.id === saleId)
    if (!sale) return

    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              status: "Returned",
              returnRequested: true,
              returnReason: reason,
              returnTimestamp: new Date().toISOString(),
              refundAmount: sale.totalAmount,
            }
          : sale,
      ),
    )

    // Restore stock for returned items
    sale.items.forEach((item) => {
      console.log(`Restoring stock: ${item.quantity} units of ${item.productName}`)
      // Here you would update the actual product stock in your database
    })

    toast({
      title: "Pedido Devuelto",
      description: `La venta ${saleId} ha sido marcada como devuelta. Stock de ${sale.items.length} productos restaurado.`,
    })
    setReturningOrderSale(null)
    setReturnReason("")
  }

  const handleCancelOrder = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId)
    if (!sale) return

    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              status: "Returned",
              returnRequested: true,
              returnReason: "Venta cancelada por administrador",
              returnTimestamp: new Date().toISOString(),
              refundAmount: sale.totalAmount,
            }
          : sale,
      ),
    )

    // Restore stock for cancelled items
    sale.items.forEach((item) => {
      console.log(`Restoring stock from cancellation: ${item.quantity} units of ${item.productName}`)
      // Here you would update the actual product stock in your database
    })

    toast({
      title: "Venta Cancelada",
      description: `La venta ${saleId} ha sido cancelada. Stock de ${sale.items.length} productos restaurado automáticamente.`,
    })
    setCancellingOrderSale(null)
  }

  const handleEditOrder = (sale: Sale) => {
    setEditingOrderSale(sale)
  }

  const handleSaveEditedOrder = (updatedItems: any[]) => {
    if (!editingOrderSale) return

    const originalSale = editingOrderSale
    const newTotal = updatedItems.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0)

    // Calculate stock changes
    const stockChanges: { [productId: string]: number } = {}

    // Calculate what was removed or reduced
    originalSale.items.forEach((originalItem) => {
      const updatedItem = updatedItems.find((item) => item.productId === originalItem.productId)
      if (!updatedItem) {
        // Item was completely removed - restore full quantity
        stockChanges[originalItem.productId] = (stockChanges[originalItem.productId] || 0) + originalItem.quantity
      } else if (updatedItem.quantity < originalItem.quantity) {
        // Quantity was reduced - restore the difference
        const difference = originalItem.quantity - updatedItem.quantity
        stockChanges[originalItem.productId] = (stockChanges[originalItem.productId] || 0) + difference
      }
    })

    // Calculate what was added or increased
    updatedItems.forEach((updatedItem) => {
      const originalItem = originalSale.items.find((item) => item.productId === updatedItem.productId)
      if (!originalItem) {
        // New item was added - reduce stock
        stockChanges[updatedItem.productId] = (stockChanges[updatedItem.productId] || 0) - updatedItem.quantity
      } else if (updatedItem.quantity > originalItem.quantity) {
        // Quantity was increased - reduce stock by the difference
        const difference = updatedItem.quantity - originalItem.quantity
        stockChanges[updatedItem.productId] = (stockChanges[updatedItem.productId] || 0) - difference
      }
    })

    // Apply stock changes
    Object.entries(stockChanges).forEach(([productId, change]) => {
      const product = mockProducts.find((p) => p.product_id === productId)
      if (product && change !== 0) {
        console.log(
          `Stock change for ${product.name}: ${change > 0 ? "+" : ""}${change} (${change > 0 ? "restored" : "reduced"})`,
        )
        // Here you would update the actual product stock in your database
      }
    })

    // Update the sale
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === editingOrderSale.id
          ? {
              ...sale,
              items: updatedItems.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
              })),
              totalAmount: newTotal,
            }
          : sale,
      ),
    )

    const changesCount = Object.values(stockChanges).filter((change) => change !== 0).length
    toast({
      title: "Venta Editada",
      description: `La venta ${editingOrderSale.id} ha sido actualizada. ${changesCount > 0 ? `Stock de ${changesCount} productos ajustado automáticamente.` : "Sin cambios de stock."}`,
    })
    setEditingOrderSale(null)
  }

  const getPaymentMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case "POS":
        return <CreditCard className="w-4 h-4" />
      case "Efectivo":
        return <Banknote className="w-4 h-4" />
      case "QR_MercadoPago":
        return <QrCode className="w-4 h-4" />
      case "Transferencia":
        return <ArrowRightLeft className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const getPaymentMethodColor = (method?: PaymentMethod) => {
    switch (method) {
      case "POS":
        return "bg-blue-500"
      case "Efectivo":
        return "bg-green-500"
      case "QR_MercadoPago":
        return "bg-purple-500"
      case "Transferencia":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Sale ID",
      "Email",
      "Products",
      "Total Quantity",
      "Total Amount",
      "Sale Date",
      "Sale Type",
      "Payment Method",
      "Payment Validated",
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
      s.totalAmount || 0,
      new Date(s.saleDate).toLocaleString(),
      s.saleType,
      s.paymentMethod || "N/A",
      s.paymentValidated ? "Sí" : "No",
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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Ventas</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/sales/cash-orders">
            <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <Banknote className="mr-2 h-4 w-4" />
              Gestión Efectivo
              {stats.cashOrdersPending > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.cashOrdersPending}
                </Badge>
              )}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.totalSalesCount} ventas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Unidades totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo Pendiente</CardTitle>
            <Banknote className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.cashOrdersPending}</div>
            <p className="text-xs text-muted-foreground">Requieren validación</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Filter className="mr-2 h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <SelectItem key={p.product_id} value={p.product_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment-method-filter">Método de Pago</Label>
            <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange("paymentMethod", value)}>
              <SelectTrigger id="payment-method-filter">
                <SelectValue placeholder="Todos los Métodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Métodos</SelectItem>
                <SelectItem value="POS">POS (Tarjeta)</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="QR_MercadoPago">QR Mercado Pago</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment-validation-filter">Validación de Pago</Label>
            <Select
              value={filters.paymentValidated}
              onValueChange={(value) => handleFilterChange("paymentValidated", value)}
            >
              <SelectTrigger id="payment-validation-filter">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="validated">Validados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
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
          <CardTitle className="text-lg sm:text-xl">Ventas Registradas</CardTitle>
          <CardDescription>Mostrando {filteredSales.length} ventas según los filtros aplicados.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Validación</TableHead>
                <TableHead>Fecha Venta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{sale.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.items.length === 1
                      ? `${sale.items[0].productName} (x${sale.items[0].quantity})`
                      : `${sale.items.length} items`}
                  </TableCell>
                  <TableCell className="font-semibold">${(sale.totalAmount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getPaymentMethodColor(sale.paymentMethod)} text-white`}>
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="ml-1">{sale.paymentMethod || "N/A"}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sale.paymentValidated ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <Check className="mr-1 h-3 w-3" /> Validado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" /> Pendiente
                      </Badge>
                    )}
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
                    ) : sale.status === "Returned" ? (
                      <Badge variant="destructive">
                        <ArrowRightLeft className="mr-1 h-3 w-3" /> Devuelta
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <Clock className="mr-1 h-3 w-3" /> Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Botones de acción rápida */}
                      {sale.status !== "Returned" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOrder(sale)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          {sale.status === "Delivered" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReturningOrderSale(sale)}
                              className="h-8 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <ArrowRightLeft className="h-3 w-3 mr-1" />
                              Devolver
                            </Button>
                          )}
                        </>
                      )}

                      {/* Dropdown con más opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Más Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingSaleDetails(sale)}>Ver Detalles</DropdownMenuItem>
                          {!sale.paymentValidated && (
                            <DropdownMenuItem
                              onClick={() => {
                                setValidatingPaymentSale(sale)
                                setSelectedPaymentMethod(sale.paymentMethod)
                              }}
                            >
                              Validar Pago
                            </DropdownMenuItem>
                          )}
                          {sale.status === "Pending" && (
                            <DropdownMenuItem onClick={() => setConfirmingDeliverySale(sale)}>
                              Marcar como Entregada
                            </DropdownMenuItem>
                          )}
                          {sale.status !== "Returned" && (
                            <DropdownMenuItem
                              onClick={() => setCancellingOrderSale(sale)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar Venta
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No se encontraron ventas con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Total de ventas mostradas: <strong>{filteredSales.length}</strong> | Total en ventas:{" "}
            <strong>${filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toLocaleString()}</strong>
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
              <strong>Total:</strong> ${(viewingSaleDetails?.totalAmount || 0).toLocaleString()}
            </p>
            <p>
              <strong>Método de Pago:</strong>
              <Badge
                variant="outline"
                className={`ml-2 ${getPaymentMethodColor(viewingSaleDetails?.paymentMethod)} text-white`}
              >
                {getPaymentMethodIcon(viewingSaleDetails?.paymentMethod)}
                <span className="ml-1">{viewingSaleDetails?.paymentMethod || "N/A"}</span>
              </Badge>
            </p>
            <p>
              <strong>Pago Validado:</strong>
              {viewingSaleDetails?.paymentValidated ? (
                <Badge variant="default" className="ml-2 bg-green-500 text-white">
                  <Check className="mr-1 h-3 w-3" /> Sí
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">
                  <AlertCircle className="mr-1 h-3 w-3" /> No
                </Badge>
              )}
            </p>
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

      {/* Validate Payment Dialog */}
      <Dialog
        open={!!validatingPaymentSale}
        onOpenChange={(open) => {
          if (!open) {
            setValidatingPaymentSale(null)
            setSelectedPaymentMethod(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validar Pago</DialogTitle>
            <DialogDescription>
              Confirma el pago de <strong>${(validatingPaymentSale?.totalAmount || 0).toLocaleString()}</strong> para la
              venta <strong>{validatingPaymentSale?.id}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">${(validatingPaymentSale?.totalAmount || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{validatingPaymentSale?.email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method-validation">Método de Pago</Label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Actual:</span>
                <Badge
                  variant="outline"
                  className={`${getPaymentMethodColor(validatingPaymentSale?.paymentMethod)} text-white`}
                >
                  {getPaymentMethodIcon(validatingPaymentSale?.paymentMethod)}
                  <span className="ml-1">{validatingPaymentSale?.paymentMethod || "N/A"}</span>
                </Badge>
              </div>
              <select
                id="payment-method-validation"
                value={selectedPaymentMethod || validatingPaymentSale?.paymentMethod || ""}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="POS">💳 POS (Tarjeta)</option>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="QR_MercadoPago">📱 QR Mercado Pago</option>
                <option value="Transferencia">🔄 Transferencia</option>
              </select>
              {selectedPaymentMethod && selectedPaymentMethod !== validatingPaymentSale?.paymentMethod && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Se cambiará de {validatingPaymentSale?.paymentMethod} a {selectedPaymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setValidatingPaymentSale(null)
                setSelectedPaymentMethod(undefined)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600"
              onClick={() =>
                validatingPaymentSale &&
                handleValidatePayment(
                  validatingPaymentSale.id,
                  selectedPaymentMethod || validatingPaymentSale.paymentMethod,
                )
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Validar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Order Dialog */}
      <Dialog open={!!returningOrderSale} onOpenChange={(open) => !open && setReturningOrderSale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Procesar Devolución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres procesar la devolución de la venta <strong>{returningOrderSale?.id}</strong>{" "}
              por <strong>${(returningOrderSale?.totalAmount || 0).toLocaleString()}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="return-reason">Motivo de la devolución</Label>
            <select
              id="return-reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar motivo...</option>
              <option value="Producto defectuoso">Producto defectuoso</option>
              <option value="Talla incorrecta">Talla incorrecta</option>
              <option value="No le gustó">No le gustó</option>
              <option value="Pedido duplicado">Pedido duplicado</option>
              <option value="Cambio de opinión">Cambio de opinión</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturningOrderSale(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!returnReason}
              onClick={() => returningOrderSale && handleReturnOrder(returningOrderSale.id, returnReason)}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Procesar Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancellingOrderSale} onOpenChange={(open) => !open && setCancellingOrderSale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Venta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar la venta <strong>{cancellingOrderSale?.id}</strong>? Esta acción
              restaurará automáticamente el stock de todos los productos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-center">
                <Trash2 className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">Venta: {cancellingOrderSale?.id}</div>
                <div className="text-sm text-muted-foreground">Cliente: {cancellingOrderSale?.email}</div>
                <div className="text-sm text-muted-foreground">
                  Total: ${(cancellingOrderSale?.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-red-600 mt-2 font-medium">
                  Se restaurará el stock de {cancellingOrderSale?.items.length} productos automáticamente
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingOrderSale(null)}>
              No, Mantener Venta
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancellingOrderSale && handleCancelOrder(cancellingOrderSale.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sí, Cancelar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      {editingOrderSale && (
        <EditOrderDialog
          open={!!editingOrderSale}
          onOpenChange={(open) => !open && setEditingOrderSale(null)}
          orderItems={editingOrderSale.items.map((item) => ({
            id: `item_${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            size: "M", // Default size, you might want to store this in the sale
            quantity: item.quantity,
            unitPrice:
              (editingOrderSale.totalAmount || 0) / editingOrderSale.items.reduce((sum, i) => sum + i.quantity, 0), // Estimate unit price
          }))}
          onSaveChanges={handleSaveEditedOrder}
        />
      )}
    </div>
  )
}
