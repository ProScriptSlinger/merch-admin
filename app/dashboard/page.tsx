import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, Store, CheckCircle, TrendingUp } from "lucide-react"
import { mockProducts, mockStands, mockDeliveries, getTotalAssignedStock } from "@/lib/data"

export default function DashboardOverviewPage() {
  const totalProducts = mockProducts.length
  const totalStands = mockStands.length
  const totalDeliveries = mockDeliveries.reduce((sum, d) => sum + d.quantity, 0)

  let totalStock = 0
  let totalAssigned = 0
  mockProducts.forEach((p) => {
    totalStock += p.total_quantity || 0
    totalAssigned += getTotalAssignedStock(p)
  })
  const overallRemainingStock = totalStock - totalAssigned

  const stats = [
    { title: "Total Products", value: totalProducts, icon: Package, description: "Variety of items available" },
    { title: "Active Stands", value: totalStands, icon: Store, description: "Distribution points" },
    { title: "Items Delivered", value: totalDeliveries, icon: CheckCircle, description: "Successfully handed out" },
    {
      title: "Overall Remaining Stock",
      value: overallRemainingStock,
      icon: TrendingUp,
      description: "Across all products",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
            {mockDeliveries.slice(0, 5).map((delivery) => {
              const product = mockProducts.find((p) => p.id === delivery.productId)
              const stand = mockStands.find((s) => s.id === delivery.standId)
              return (
                <div key={delivery.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{product?.name || "Unknown Product"}</p>
                    <p className="text-sm text-muted-foreground">To: {stand?.name || "Unknown Stand"}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(delivery.timestamp).toLocaleTimeString()}</p>
                </div>
              )
            })}
            {mockDeliveries.length === 0 && <p className="text-muted-foreground">No deliveries recorded yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products running low on stock.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockProducts
              .filter((p) => {
                const totalStock = p.total_quantity || 0
                const threshold = p.low_stock_threshold || 5
                return totalStock <= threshold
              })
              .map((product) => (
                <div
                  key={product.product_id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-red-500">Stock: {product.total_quantity}</p>
                </div>
              ))}
            {mockProducts.filter((p) => {
              const totalStock = p.total_quantity || 0
              const threshold = p.low_stock_threshold || 5
              return totalStock <= threshold
            }).length === 0 && <p className="text-muted-foreground">All products have sufficient stock.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
