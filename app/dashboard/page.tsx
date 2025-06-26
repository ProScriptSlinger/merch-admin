"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, Store, CheckCircle, TrendingUp, Loader2 } from "lucide-react"
import { getProducts } from "@/lib/services/products"
import { getStands } from "@/lib/services/stands"
import { getSales } from "@/lib/services/sales"

interface DashboardStats {
  totalProducts: number
  totalStands: number
  totalDeliveries: number
  overallRemainingStock: number
  recentDeliveries: Array<{
    id: string
    productName: string
    standName: string
    timestamp: string
    quantity: number
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    totalQuantity: number
    lowStockThreshold: number
  }>
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStands: 0,
    totalDeliveries: 0,
    overallRemainingStock: 0,
    recentDeliveries: [],
    lowStockProducts: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [products, stands, sales] = await Promise.all([
        getProducts(),
        getStands(),
        getSales(),
      ])

      // Calculate total products
      const totalProducts = products.length

      // Calculate total stands
      const totalStands = stands.length

      // Calculate total deliveries (completed sales)
      const totalDeliveries = sales
        .filter(sale => sale.status === 'delivered')
        .reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

      // Calculate overall remaining stock
      const overallRemainingStock = products.reduce((sum, product) => {
        const totalQuantity = product.variants.reduce((variantSum, variant) => variantSum + variant.quantity, 0)
        return sum + totalQuantity
      }, 0)

      // Get recent deliveries (last 5 delivered sales)
      const recentDeliveries = sales
        .filter(sale => sale.status === 'delivered')
        .sort((a, b) => new Date(b.delivery_timestamp || b.created_at).getTime() - new Date(a.delivery_timestamp || a.created_at).getTime())
        .slice(0, 5)
        .map(sale => ({
          id: sale.id,
          productName: sale.items[0]?.product_variant.product.name || 'Unknown Product',
          standName: sale.delivered_by_stand?.name || sale.stand?.name || 'Unknown Stand',
          timestamp: sale.delivery_timestamp || sale.created_at,
          quantity: sale.items.reduce((sum, item) => sum + item.quantity, 0),
        }))

      console.log('recentDeliveries ------>',recentDeliveries, sales)
        console.log('products ------>',products)
      // Get low stock products
      const lowStockProducts = products
        .filter(product => {
          const totalQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0)
          const threshold = product.low_stock_threshold || 5
          return totalQuantity <= threshold
        })
        .map(product => ({
          id: product.id,
          name: product.name,
          totalQuantity: product.variants.reduce((sum, variant) => sum + variant.quantity, 0),
          lowStockThreshold: product.low_stock_threshold || 5,
        }))

      setStats({
        totalProducts,
        totalStands,
        totalDeliveries,
        overallRemainingStock,
        recentDeliveries,
        lowStockProducts,
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const dashboardStats = [
    { 
      title: "Total Products", 
      value: stats.totalProducts, 
      icon: Package, 
      description: "Variety of items available" 
    },
    { 
      title: "Active Stands", 
      value: stats.totalStands, 
      icon: Store, 
      description: "Distribution points" 
    },
    { 
      title: "Items Delivered", 
      value: stats.totalDeliveries, 
      icon: CheckCircle, 
      description: "Successfully handed out" 
    },
    {
      title: "Overall Remaining Stock",
      value: stats.overallRemainingStock,
      icon: TrendingUp,
      description: "Across all products",
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Last 5 deliveries made.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentDeliveries.length > 0 ? (
              stats.recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{delivery.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {delivery.standName} (x{delivery.quantity})
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(delivery.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No deliveries recorded yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products running low on stock.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-red-500">
                    Stock: {product.totalQuantity} (Threshold: {product.lowStockThreshold})
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">All products have sufficient stock.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
