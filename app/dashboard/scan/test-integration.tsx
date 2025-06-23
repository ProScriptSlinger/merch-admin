"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getOrderByQRCode, getOrders } from "@/lib/services/orders"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function TestIntegration() {
  const [testResults, setTestResults] = useState<{
    qrTest: { success: boolean; message: string } | null
    ordersTest: { success: boolean; message: string } | null
  }>({
    qrTest: null,
    ordersTest: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const testQRCodeLookup = async () => {
    setIsLoading(true)
    try {
      const order = await getOrderByQRCode("ORDER-QR-001")
      if (order) {
        setTestResults(prev => ({
          ...prev,
          qrTest: {
            success: true,
            message: `✅ QR lookup successful! Found order for ${order.customer_name} with ${order.items.length} items.`
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          qrTest: {
            success: false,
            message: "❌ QR lookup failed: Order not found. Make sure demo data is seeded."
          }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        qrTest: {
          success: false,
          message: `❌ QR lookup error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const testOrdersFetch = async () => {
    setIsLoading(true)
    try {
      const orders = await getOrders()
      setTestResults(prev => ({
        ...prev,
        ordersTest: {
          success: true,
          message: `✅ Orders fetch successful! Found ${orders.length} orders in database.`
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        ordersTest: {
          success: false,
          message: `❌ Orders fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Test Supabase Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testQRCodeLookup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing QR Lookup...
              </>
            ) : (
              "Test QR Code Lookup"
            )}
          </Button>
          
          {testResults.qrTest && (
            <Alert className={testResults.qrTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {testResults.qrTest.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResults.qrTest.success ? "text-green-800" : "text-red-800"}>
                {testResults.qrTest.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testOrdersFetch} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Orders Fetch...
              </>
            ) : (
              "Test Orders Fetch"
            )}
          </Button>
          
          {testResults.ordersTest && (
            <Alert className={testResults.ordersTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {testResults.ordersTest.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResults.ordersTest.success ? "text-green-800" : "text-red-800"}>
                {testResults.ordersTest.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Integration Status
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This test verifies that the scan page can successfully connect to and query the Supabase orders table. 
            Run both tests to ensure the integration is working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 