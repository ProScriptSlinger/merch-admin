"use client"

import { Label } from "@/components/ui/label"
import Link from "next/link"

import { useState, useMemo, useEffect } from "react"
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
import type { PaymentMethod } from "@/lib/types"
import { EditOrderDialog } from "../scan/edit-order-dialog"
import {
  getSales,
  getSalesStats,
  markSaleAsDelivered,
  validatePayment,
  processReturn,
  cancelSale,
  updateSaleItems,
  type SaleWithDetails,
  type SalesFilters,
  type SalesStats,
} from "@/lib/services/sales"
import { getProducts } from "@/lib/services/products"
import { getStands } from "@/lib/services/stands"
import type { ProductWithDetails } from "@/lib/services/products"
import type { Stand } from "@/lib/types"
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
  Loader2,
} from "lucide-react"

export default function SalesPage() {
  const [sales, setSales] = useState<SaleWithDetails[]>([])
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [stands, setStands] = useState<Stand[]>([])
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalProducts: 0,
    validatedSales: 0,
    pendingValidation: 0,
    returnedSales: 0,
    cashOrdersPending: 0,
    totalSalesCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<SalesFilters>({
    email: "",
    productId: "all",
    standId: "all",
    saleType: "all",
    status: "all",
    paymentMethod: "all",
    paymentValidated: "all",
    dateFrom: "",
    dateTo: "",
  })
  const [viewingSaleDetails, setViewingSaleDetails] = useState<SaleWithDetails | null>(null)
  const [confirmingDeliverySale, setConfirmingDeliverySale] = useState<SaleWithDetails | null>(null)
  const [validatingPaymentSale, setValidatingPaymentSale] = useState<SaleWithDetails | null>(null)
  const [returningOrderSale, setReturningOrderSale] = useState<SaleWithDetails | null>(null)
  const [editingOrderSale, setEditingOrderSale] = useState<SaleWithDetails | null>(null)
  const [cancellingOrderSale, setCancellingOrderSale] = useState<SaleWithDetails | null>(null)
  const [returnReason, setReturnReason] = useState("")

  const { toast } = useToast()

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [salesData, productsData, standsData, statsData] = await Promise.all([
        getSales(),
        getProducts(),
        getStands(),
        getSalesStats(),
      ])
      
      setSales(salesData)
      setProducts(productsData)
      setStands(standsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Error loading sales data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reload sales when filters change
  useEffect(() => {
    if (!isLoading) {
      loadFilteredSales()
    }
  }, [filters])

  const loadFilteredSales = async () => {
    try {
      const salesData = await getSales(filters)
      setSales(salesData)
    } catch (error) {
      console.error('Error loading filtered sales:', error)
      toast({
        title: "Error",
        description: "Error loading filtered sales data.",
        variant: "destructive",
      })
    }
  }

  const handleFilterChange = (filterName: keyof SalesFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const handleMarkAsDelivered = async (saleId: string) => {
    try {
      await markSaleAsDelivered(saleId)
      await loadData() // Reload data to get updated stats
      toast({
        title: "Sale Marked as Delivered",
        description: `Sale ID ${saleId} has been updated.`,
      })
      setConfirmingDeliverySale(null)
    } catch (error) {
      console.error('Error marking sale as delivered:', error)
      toast({
        title: "Error",
        description: "Error marking sale as delivered.",
        variant: "destructive",
      })
    }
  }

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>("card")

  const handleValidatePayment = async (saleId: string, newPaymentMethod?: PaymentMethod) => {
    try {
      await validatePayment(saleId, newPaymentMethod)
      await loadData() // Reload data to get updated stats
      toast({
        title: "Pago Validado",
        description: `El pago de la venta ${saleId} ha sido validado correctamente con método: ${newPaymentMethod || "original"}.`,
      })
      setValidatingPaymentSale(null)
      setSelectedPaymentMethod(undefined)
    } catch (error) {
      console.error('Error validating payment:', error)
      toast({
        title: "Error",
        description: "Error validating payment.",
        variant: "destructive",
      })
    }
  }

  const handleReturnOrder = async (saleId: string, reason: string) => {
    try {
      await processReturn(saleId, reason)
      await loadData() // Reload data to get updated stats
      toast({
        title: "Pedido Devuelto",
        description: `La venta ${saleId} ha sido marcada como devuelta. Stock restaurado automáticamente.`,
      })
      setReturningOrderSale(null)
      setReturnReason("")
    } catch (error) {
      console.error('Error processing return:', error)
      toast({
        title: "Error",
        description: "Error processing return.",
        variant: "destructive",
      })
    }
  }

  const handleCancelOrder = async (saleId: string) => {
    try {
      await cancelSale(saleId)
      await loadData() // Reload data to get updated stats
      toast({
        title: "Venta Cancelada",
        description: `La venta ${saleId} ha sido cancelada. Stock restaurado automáticamente.`,
      })
      setCancellingOrderSale(null)
    } catch (error) {
      console.error('Error cancelling sale:', error)
      toast({
        title: "Error",
        description: "Error cancelling sale.",
        variant: "destructive",
      })
    }
  }

  const handleEditOrder = (sale: SaleWithDetails) => {
    setEditingOrderSale(sale)
  }

  const handleSaveEditedOrder = async (updatedItems: any[]) => {
    if (!editingOrderSale) return

    try {
      await updateSaleItems(editingOrderSale.id, updatedItems)
      await loadData() // Reload data to get updated stats
      toast({
        title: "Venta Editada",
        description: `La venta ${editingOrderSale.id} ha sido actualizada. Stock ajustado automáticamente.`,
      })
      setEditingOrderSale(null)
    } catch (error) {
      console.error('Error updating sale items:', error)
      toast({
        title: "Error",
        description: "Error updating sale items.",
        variant: "destructive",
      })
    }
  }

  const getPaymentMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />
      case "cash":
          return <Banknote className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const getPaymentMethodColor = (method?: PaymentMethod) => {
    switch (method) {
      case "card":
        return "bg-blue-500"
      case "cash":
        return "bg-green-500"
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
    const rows = sales.map((s) => [
      s.id,
      s.customer_email,
      s.items.map((item) => `${item.product_variant.product.name} (x${item.quantity})`).join("; "),
      s.items.reduce((sum, item) => sum + item.quantity, 0),
      s.total_amount || 0,
      new Date(s.created_at).toLocaleString(),
      s.sale_type,
      s.payment_method || "N/A",
      s.payment_validated ? "Sí" : "No",
      s.status,
      stands.find((stand) => stand.id === s.stand_id)?.name || "N/A",
      s.delivery_qr_value || "N/A",
      stands.find((stand) => stand.id === s.delivered_by_stand_id)?.name || "N/A",
      s.delivery_timestamp ? new Date(s.delivery_timestamp).toLocaleString() : "N/A",
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading sales data...</span>
          </div>
        </div>
      </div>
    )
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
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
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
                {stands.map((s) => (
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
              onValueChange={(value) => handleFilterChange("status", value as "all" | "pending" | "delivered" | "cancelled" | "returned")}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="delivered">Entregada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="returned">Devuelta</SelectItem>
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
          <CardDescription>Mostrando {sales.length} ventas según los filtros aplicados.</CardDescription>
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
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{sale.customer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.items.length === 1
                      ? `${sale.items[0].product_variant.product.name} (x${sale.items[0].quantity})`
                      : `${sale.items.length} items`}
                  </TableCell>
                  <TableCell className="font-semibold">${(sale.total_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getPaymentMethodColor(sale?.payment_method || "cash")} text-white`}>
                      {getPaymentMethodIcon(sale?.payment_method || "cash")}
                      <span className="ml-1">{sale?.payment_method || "N/A"}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sale.payment_validated ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <Check className="mr-1 h-3 w-3" /> Validado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" /> Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={sale.sale_type === "Online" ? "secondary" : "outline"}>
                      <ShoppingBag className="mr-1 h-3 w-3" />
                      {sale.sale_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sale.status === "delivered" ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" /> Entregada
                      </Badge>
                    ) : sale.status === "returned" || sale.status === "cancelled" ? (
                      <Badge variant="destructive">
                        <ArrowRightLeft className="mr-1 h-3 w-3" /> {sale.status === "returned" ? "Devuelta" : "Cancelada"}
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
                      {sale.status !== "returned" && sale.status !== "cancelled" && (
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
                          {sale.status === "delivered" && (
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
                          {!sale.payment_validated && (
                            <DropdownMenuItem
                              onClick={() => {
                                setValidatingPaymentSale(sale)
                                setSelectedPaymentMethod(sale?.payment_method || "card")
                              }}
                            >
                              Validar Pago
                            </DropdownMenuItem>
                          )}
                          {sale.status === "pending" && (
                            <DropdownMenuItem onClick={() => setConfirmingDeliverySale(sale)}>
                              Marcar como Entregada
                            </DropdownMenuItem>
                          )}
                          {sale.status !== "returned" && sale.status !== "cancelled" && (
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
              {sales.length === 0 && (
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
            Total de ventas mostradas: <strong>{sales.length}</strong> | Total en ventas:{" "}
            <strong>${sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0).toLocaleString()}</strong>
          </div>
        </CardFooter>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={!!viewingSaleDetails} onOpenChange={(open) => !open && setViewingSaleDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta - {viewingSaleDetails?.id}</DialogTitle>
            <DialogDescription>
              Email: {viewingSaleDetails?.customer_email} | Tipo: {viewingSaleDetails?.sale_type} | Estado:{" "}
              {viewingSaleDetails?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <h4 className="font-semibold">Items:</h4>
            {viewingSaleDetails?.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.product_variant.product.name} (Talle: {item.product_variant.size})
                </span>
                <span>x {item.quantity} - ${item.unit_price}</span>
              </div>
            ))}
            <hr className="my-2" />
            <p>
              <strong>Total:</strong> ${(viewingSaleDetails?.total_amount || 0).toLocaleString()}
            </p>
            <p>
              <strong>Método de Pago:</strong>
              <Badge
                variant="outline"
                className={`ml-2 ${getPaymentMethodColor(viewingSaleDetails?.payment_method || "cash")} text-white`}
              >
                {getPaymentMethodIcon(viewingSaleDetails?.payment_method || "cash")}
                <span className="ml-1">{viewingSaleDetails?.payment_method || "N/A"}</span>
              </Badge>
            </p>
            <p>
              <strong>Pago Validado:</strong>
              {viewingSaleDetails?.payment_validated ? (
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
              {viewingSaleDetails?.created_at ? new Date(viewingSaleDetails.created_at).toLocaleString() : "N/A"}
            </p>
            {viewingSaleDetails?.stand_id && (
              <p>
                <strong>Stand (POS):</strong>{" "}
                {stands.find((s) => s.id === viewingSaleDetails.stand_id)?.name || "N/A"}
              </p>
            )}
            {viewingSaleDetails?.delivery_qr_value && (
              <p>
                <strong>QR de Entrega:</strong> {viewingSaleDetails.delivery_qr_value}
              </p>
            )}
            {viewingSaleDetails?.delivered_by_stand_id && (
              <p>
                <strong>Entregado por Stand:</strong>{" "}
                {stands.find((s) => s.id === viewingSaleDetails.delivered_by_stand_id)?.name || "N/A"}
              </p>
            )}
            {viewingSaleDetails?.delivery_timestamp && (
              <p>
                <strong>Fecha Entrega:</strong> {new Date(viewingSaleDetails.delivery_timestamp).toLocaleString()}
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
              <strong>{confirmingDeliverySale?.customer_email}</strong> como ENTREGADA? Esta acción no se puede deshacer
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
              Confirma el pago de <strong>${(validatingPaymentSale?.total_amount || 0).toLocaleString()}</strong> para la
              venta <strong>{validatingPaymentSale?.id}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">${(validatingPaymentSale?.total_amount || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{validatingPaymentSale?.customer_email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method-validation">Método de Pago</Label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Actual:</span>
                <Badge
                  variant="outline"
                  className={`${getPaymentMethodColor(validatingPaymentSale?.payment_method || "cash")} text-white`}
                >
                  {getPaymentMethodIcon(validatingPaymentSale?.payment_method || "cash")}
                  <span className="ml-1">{validatingPaymentSale?.payment_method || "N/A"}</span>
                </Badge>
              </div>
              <select
                id="payment-method-validation"
                value={selectedPaymentMethod || validatingPaymentSale?.payment_method || ""}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="card">💳 POS (Tarjeta)</option>
                <option value="cash">💵 Efectivo</option>
              </select>
              {selectedPaymentMethod && selectedPaymentMethod !== validatingPaymentSale?.payment_method && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Se cambiará de {validatingPaymentSale?.payment_method} a {selectedPaymentMethod}
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
                  selectedPaymentMethod || validatingPaymentSale?.payment_method || "cash",
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
              por <strong>${(returningOrderSale?.total_amount || 0).toLocaleString()}</strong>?
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
                <div className="text-sm text-muted-foreground">Cliente: {cancellingOrderSale?.customer_email}</div>
                <div className="text-sm text-muted-foreground">
                  Total: ${(cancellingOrderSale?.total_amount || 0).toLocaleString()}
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
          orderItems={editingOrderSale.items}
          onSaveChanges={handleSaveEditedOrder}
        />
      )}
    </div>
  )
}
