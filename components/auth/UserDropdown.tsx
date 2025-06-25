'use client'

import { QrCode, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserDropdown() {
  const { user, signOut } = useAuth()
  console.log(user);
  return (
    <>
      {/* Botón SCANEAR QR */}
      <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
        <Link href="/dashboard/scan" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">SCANEAR QR</span>
          <span className="sm:hidden">SCAN</span>
        </Link>
      </Button>

      {/* User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.user_metadata?.name || ''} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.name || 'Usuario'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Rol: {user?.user_metadata?.role || "admin"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 