'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { SalesFilters, SaleWithDetails } from '@/lib/services/sales'
import { Stand } from '@/lib/types'
import { getProducts, ProductWithDetails } from '@/lib/services/products'
import { getSales } from '@/lib/services/sales'
import { getStands } from '@/lib/services/stands'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { getOrders, OrderWithDetails } from '@/lib/services/orders'

interface AppContextType {
  sales: SaleWithDetails[]
  stands: Stand[]
  products: ProductWithDetails[]
  isLoading: boolean
  error: string | null
  orders: OrderWithDetails[]
  fetchSales: (filters?: SalesFilters ) => Promise<void>
  fetchStands: () => Promise<void>
  fetchProducts: () => Promise<void>
  fetchOrders: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [sales, setSales] = useState<SaleWithDetails[]>([])
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [stands, setStands] = useState<Stand[]>([])
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel("orders_realtime_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes
          schema: "public",
          table: "orders",
        },
        async (payload: any) => {
          try {
            console.log("Order change detected:", payload);
            toast({
              title: "Order change detected",
              description: "Refreshing sales data...",
            })
            fetchSales();
          } catch (err) {
            console.error("Error processing order update:", err);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to orders changes");
        }
        if (err) {
          console.error("Subscription error:", err);
        }
      });
  }, [])

  const fetchSales = async (filters?: SalesFilters) => {
    const sales = await getSales(filters)
    setSales(sales)
  }

  const fetchStands = async () => {
    const stands = await getStands()
    setStands(stands)
  }

  const fetchProducts = async () => {
    const products = await getProducts()
    setProducts(products)
  }

  const fetchOrders = async () => {
    const orders = await getOrders()
    setOrders(orders)
  }


  useEffect(() => {
    fetchSales()
    fetchStands()
    fetchProducts()
    fetchOrders()
    }, [])

  return (
    <AppContext.Provider value={{ sales, stands, products, isLoading, error, orders, fetchSales, fetchStands, fetchProducts, fetchOrders }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
