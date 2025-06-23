"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Search,
  Eye,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Activity,
  QrCode,
  TrendingUp,
  UserCheck,
  Loader2,
} from "lucide-react"
import { getUsers, type UserProfile } from "@/lib/services/users"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const { subscribeToRealtime, unsubscribeFromRealtime } = useApp()
  const { toast } = useToast()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()

    // Subscribe to real-time updates
    // subscribeToRealtime('users', (payload) => {
    //   console.log('Users real-time update:', payload)
    //   fetchUsers()
    // })

    // Cleanup subscription
    // return () => {
    //   unsubscribeFromRealtime('users')
    // }
  }, [])

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [users, searchTerm])

  // Estadísticas de usuarios
  const stats = useMemo(() => {
    const totalUsers = users.length
    const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0)
    const totalPurchases = users.reduce((sum, user) => sum + (user.total_purchases || 0), 0)
    const activeUsers = users.filter((user) => {
      const lastActivity = new Date(user.last_activity)
      const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceActivity <= 7
    }).length

    return {
      totalUsers,
      totalBalance,
      totalPurchases,
      activeUsers,
    }
  }, [users])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getActivityStatus = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity)
    const daysSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActivity <= 1) return { status: "Hoy", color: "bg-green-500" }
    if (daysSinceActivity <= 7) return { status: "Esta semana", color: "bg-blue-500" }
    if (daysSinceActivity <= 30) return { status: "Este mes", color: "bg-yellow-500" }
    return { status: "Inactivo", color: "bg-gray-500" }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>
      case 'manager':
        return <Badge variant="default">Manager</Badge>
      case 'staff':
        return <Badge variant="secondary">Staff</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando usuarios...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Usuarios Registrados
          </h1>
          <p className="text-muted-foreground mt-2">Gestiona y visualiza todos los usuarios de la aplicación</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Activos esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">En todas las cuentas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">Volumen histórico</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, email, teléfono o código QR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpiar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </p>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const activityStatus = getActivityStatus(user.last_activity)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name || user.email} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name || "Sin nombre"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">{formatCurrency(user.balance || 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">{user.total_purchases || 0}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activityStatus.color}`}></div>
                          <span className="text-sm">{activityStatus.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalles del Usuario</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name || user.email} />
                                  <AvatarFallback>
                                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{user.full_name || "Sin nombre"}</h3>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  {getRoleBadge(user.role)}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Balance:</span>
                                  <div className="font-mono">{formatCurrency(user.balance || 0)}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Compras:</span>
                                  <div>{user.total_purchases || 0}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Teléfono:</span>
                                  <div>{user.phone || "No especificado"}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Registro:</span>
                                  <div>{formatDate(user.created_at)}</div>
                                </div>
                              </div>

                              {user.qr_code && (
                                <div>
                                  <span className="font-medium text-sm">Código QR:</span>
                                  <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                                    {user.qr_code}
                                  </div>
                                </div>
                              )}

                              <div>
                                <span className="font-medium text-sm">Última actividad:</span>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(user.last_activity)}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
