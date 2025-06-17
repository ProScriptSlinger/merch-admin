"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Store, QrCode, ShoppingCart, Settings } from "lucide-react" // Changed FileText to ShoppingCart
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/types"

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Stands",
    href: "/dashboard/stands",
    icon: Store,
  },
  {
    title: "Ventas", // Changed from Reports
    href: "/dashboard/sales", // Changed from /reports
    icon: ShoppingCart, // Changed icon
  },
  {
    title: "Scan QR",
    href: "/dashboard/scan",
    icon: QrCode,
  },
  // Example of adding a new section, e.g., Customers
  // {
  //   title: "Customers",
  //   href: "/dashboard/customers",
  //   icon: Users,
  // },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state: sidebarState } = useSidebar()

  return (
    <Sidebar collapsible="icon" defaultOpen={true}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-sidebar-accent">
            <Package className="h-6 w-6" />
          </Button>
          {sidebarState === "expanded" && (
            <h1 className="text-lg font-semibold text-primary-foreground">Merch Admin</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenuUserProfile />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// Dummy User Profile Dropdown for Sidebar Footer
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle } from "lucide-react"

function DropdownMenuUserProfile() {
  const { state: sidebarState } = useSidebar()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start p-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            sidebarState === "collapsed" && "justify-center size-8 p-0",
          )}
        >
          <UserCircle className={cn("h-5 w-5", sidebarState === "expanded" && "mr-2")} />
          {sidebarState === "expanded" && <span>Admin User</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align={sidebarState === "expanded" ? "center" : "end"} className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
