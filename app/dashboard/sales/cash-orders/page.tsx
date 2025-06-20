"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { mockSales } from "@/lib/data"
import type { Sale } from "@/lib/types"
import {
  Check,
  X,
  Edit,
  Clock,
  AlertTriangle,
  Banknote,
  Package,
  User,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  Trash2,
} from "lucide-react"

interface CashOrderAction {
  id: string
  orderId: string
  action: "validated" | "cancelled" | "edited"
  timestamp: string
  user: string
  details?: string
}

export default function CashOrdersPage() {
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(JSON.stringify(mockSales)))
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "validated" | "cancelled" | "expired">("all")
  const [validatingOrder, setValidatingOrder] = useState<Sale | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Sale | null>(null)
  const [editingOrder, setEditingOrder] = useState<Sale | null>(null)
  const [editedItems, setEditedItems] = useState<any[]>([])
  const [actionHistory, setActionHistory] = useState<CashOrderAction[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const { toast } = useToast()

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Filter cash orders only
  const cashOrders = useMemo(() => {
    return sales.filter((sale) => sale.paymentMethod === "Efectivo")
  }, [sales])

  // Calculate order status based on time and validation
  const getOrderStatus = (sale: Sale) => {
    if (sale.status === "Returned") return "cancelled"
    if (sale.paymentValidated) return "validated"

    const orderTime = new Date(sale.saleDate)
    const timeDiff = currentTime.getTime() - orderTime.getTime()
    const minutesPassed = Math.floor(timeDiff / (1000 * 60))

    if (minutesPassed > 30) return "expired"
    return "pending"
  }

  // Calculate remaining time for pending orders
  const getRemainingTime = (sale: Sale) => {
    const orderTime = new Date(sale.saleDate)
    const timeDiff = currentTime.getTime() - orderTime.getTime()
    const minutesPassed = Math.floor(timeDiff / (1000 * 60))
    const remainingMinutes = Math.max(0, 30 - minutesPassed)
    return remainingMinutes
  }

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return cashOrders.filter((sale) => {
      const matchesSearch = sale.email.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id.includes(searchTerm)
      const orderStatus = getOrderStatus(sale)
      const matchesStatus = statusFilter === "all" || orderStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [cashOrders, searchTerm, statusFilter, currentTime])

  // Stats for cash orders
  const stats = useMemo(() => {
    const pending = cashOrders.filter((sale) => getOrderStatus(sale) === "pending").length
    const validated = cashOrders.filter((sale) => getOrderStatus(sale) === "validated").length
    const expired = cashOrders.filter((sale) => getOrderStatus(sale) === "expired").length
    const cancelled = cashOrders.filter((sale) => getOrderStatus(sale) === "cancelled").length
    const totalAmount = cashOrders
      .filter((sale) => getOrderStatus(sale) === "validated")
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

    return { pending, validated, expired, cancelled, totalAmount }
  }, [cashOrders, currentTime])

  const handleValidatePayment = (saleId: string) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              paymentValidated: true,
              status: "Delivered",
              deliveryTimestamp: new Date().toISOString(),
            }
          : sale,
      ),
    )

    // Add to action history
    const newAction: CashOrderAction = {
      id: `action_${Date.now()}`,
      orderId: saleId,
      action: "validated",
      timestamp: new Date().toISOString(),
      user: "Usuario Actual",
      details: "Pago en efectivo validado y pedido entregado",
    }
    setActionHistory((prev) => [newAction, ...prev])

    toast({
      title: "Pago Validado",
      description: `El pedido ${saleId} ha sido validado y marcado como entregado.`,
    })
    setValidatingOrder(null)
  }

  const handleCancelOrder = (saleId: string) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              status: "Returned",
              returnRequested: true,
              returnReason: "Cancelado - No se retiró en tiempo",
              returnTimestamp: new Date().toISOString(),
            }
          : sale,
      ),
    )

    // Add to action history
    const newAction: CashOrderAction = {
      id: `action_${Date.now()}`,
      orderId: saleId,
      action: "cancelled",
      timestamp: new Date().toISOString(),
      user: "Usuario Actual",
      details: "Pedido cancelado - Stock repuesto automáticamente",
    }
    setActionHistory((prev) => [newAction, ...prev])

    toast({
      title: "Pedido Cancelado",
      description: `El pedido ${saleId} ha sido cancelado y el stock ha sido repuesto.`,
    })
    setCancellingOrder(null)
  }

  const handleEditOrder = (sale: Sale) => {
    setEditedItems(
      sale.items.map((item) => ({
        ...item,
        originalQuantity: item.quantity,
      })),
    )
    setEditingOrder(sale)
  }

  const handleSaveEditedOrder = () => {
    if (!editingOrder) return

    const newTotal = editedItems.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0)

    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === editingOrder.id
          ? {
              ...sale,
              items: editedItems.map(({ originalQuantity, unitPrice, ...item }) => item),
              totalAmount: newTotal,
            }
          : sale,
      ),
    )

    // Add to action history
    const newAction: CashOrderAction = {
      id: `action_${Date.now()}`,
      orderId: editingOrder.id,
      action: "edited",
      timestamp: new Date().toISOString(),
      user: "Usuario Actual",
      details: `Pedido editado - Nuevo total: $${newTotal.toLocaleString()}`,
    }
    setActionHistory((prev) => [newAction, ...prev])

    toast({
      title: "Pedido Editado",
      description: `El pedido ${editingOrder.id} ha sido actualizado correctamente.`,
    })
    setEditingOrder(null)
    setEditedItems([])
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 0) return
    setEditedItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const getStatusBadge = (sale: Sale) => {
    const status = getOrderStatus(sale)
    const remainingTime = getRemainingTime(sale)

    switch (status) {
      case "pending":
        return (
          <Badge variant="warning" className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente ({remainingTime}min)
          </Badge>
        )
      case "validated":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <Check className="mr-1 h-3 w-3" />
            Validado
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expirado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary">
            <X className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Pedidos en Efectivo</h1>
          <p className="text-muted-foreground">Validación y gestión ágil de pedidos con pago en efectivo</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Esperando validación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validados</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-xs text-muted-foreground">Pagados y retirados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Más de 30 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <X className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Stock repuesto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En efectivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Buscar por email o ID</Label>
            <Input
              id="search"
              placeholder="customer@example.com o sale_1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status-filter">Estado del pedido</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">⏳ Pendientes</option>
              <option value="validated">✅ Validados</option>
              <option value="expired">⚠️ Expirados</option>
              <option value="cancelled">❌ Cancelados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Pedidos en Efectivo</CardTitle>
          <CardDescription>Mostrando {filteredOrders.length} pedidos según los filtros aplicados.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((sale) => {
                const status = getOrderStatus(sale)
                const remainingTime = getRemainingTime(sale)
                return (
                  <TableRow key={sale.id} className={status === "expired" ? "bg-red-50 dark:bg-red-900/10" : ""}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{sale.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        {sale.items.length === 1
                          ? `${sale.items[0].productName} (x${sale.items[0].quantity})`
                          : `${sale.items.length} productos`}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${(sale.totalAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {new Date(sale.saleDate).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sale)}</TableCell>
                    <TableCell>
                      {status === "pending" && (
                        <div className={`text-sm ${remainingTime <= 5 ? "text-red-600 font-bold" : "text-yellow-600"}`}>
                          {remainingTime} min restantes
                        </div>
                      )}
                      {status === "validated" && <div className="text-sm text-green-600">Completado</div>}
                      {status === "expired" && <div className="text-sm text-red-600">Tiempo agotado</div>}
                      {status === "cancelled" && <div className="text-sm text-gray-600">Cancelado</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => setValidatingOrder(sale)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Validar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditOrder(sale)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setCancellingOrder(sale)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        {(status === "expired" || status === "validated") && (
                          <Button size="sm" variant="outline" onClick={() => handleEditOrder(sale)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Ver/Editar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No se encontraron pedidos en efectivo con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validate Payment Dialog */}
      <Dialog open={!!validatingOrder} onOpenChange={(open) => !open && setValidatingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validar Pago en Efectivo</DialogTitle>
            <DialogDescription>
              ¿Confirmas que el cliente <strong>{validatingOrder?.email}</strong> pagó en efectivo y retiró su pedido?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-center">
                <Banknote className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  ${(validatingOrder?.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Pago en efectivo</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidatingOrder(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => validatingOrder && handleValidatePayment(validatingOrder.id)}
            >
              <Check className="mr-2 h-4 w-4" />
              Sí, Validar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancellingOrder} onOpenChange={(open) => !open && setCancellingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés cancelar este pedido? Se repondrá el stock automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">Pedido: {cancellingOrder?.id}</div>
                <div className="text-sm text-muted-foreground">
                  Total: ${(cancellingOrder?.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-red-600 mt-2">El stock de los productos será repuesto automáticamente</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingOrder(null)}>
              No, Mantener
            </Button>
            <Button variant="destructive" onClick={() => cancellingOrder && handleCancelOrder(cancellingOrder.id)}>
              <X className="mr-2 h-4 w-4" />
              Sí, Cancelar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pedido - {editingOrder?.id}</DialogTitle>
            <DialogDescription>
              Modifica productos, cantidades o precios del pedido de {editingOrder?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {editedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-muted-foreground">ID: {item.productId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateItemQuantity(index, item.quantity - 1)}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateItemQuantity(index, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${((item.unitPrice || 0) * item.quantity).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">${(item.unitPrice || 0).toLocaleString()} c/u</div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItem(index)}
                    disabled={editedItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total del pedido:</span>
                <span className="text-xl font-bold">
                  ${editedItems.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedOrder}>
              <Check className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
