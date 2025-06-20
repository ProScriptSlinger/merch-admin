"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import {
  PlusCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  QrCodeIcon,
  ChevronDown,
  Clock,
  User,
  Phone,
} from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockStands, mockProducts } from "@/lib/data"
import type { Stand, StandStock, Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const initialStands: Stand[] = JSON.parse(JSON.stringify(mockStands)) // Deep copy

export default function StandsPage() {
  const [stands, setStands] = useState<Stand[]>(initialStands)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStand, setEditingStand] = useState<Stand | null>(null)
  const [viewingQrStand, setViewingQrStand] = useState<Stand | null>(null)
  const [expandedStandId, setExpandedStandId] = useState<string | null>(null)

  const { toast } = useToast()

  const filteredStands = useMemo(() => {
    return stands.filter(
      (stand) =>
        stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stand.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [stands, searchTerm])

  const handleAddStand = () => {
    setEditingStand(null)
    setIsFormOpen(true)
  }

  const handleEditStand = (stand: Stand) => {
    setEditingStand(stand)
    setIsFormOpen(true)
  }

  const handleDeleteStand = (standId: string) => {
    setStands(stands.filter((s) => s.id !== standId))
    toast({ title: "Stand Deleted", description: "The stand has been successfully deleted." })
  }

  const handleFormSubmit = (
    formData: Omit<Stand, "id" | "qrCodeValue" | "stock"> & { id?: string; stock: StandStock[] },
  ) => {
    if (editingStand) {
      setStands(
        stands.map((s) =>
          s.id === editingStand.id
            ? {
                ...editingStand,
                ...formData,
                imageUrl:
                  formData.imageUrl ||
                  `/placeholder.svg?width=400&height=200&query=${formData.name.replace(/\s+/g, "+")}`,
              }
            : s,
        ),
      )
      toast({ title: "Stand Updated", description: `${formData.name} has been updated.` })
    } else {
      const newStand: Stand = {
        ...formData,
        id: `stand_${Date.now()}`,
        qrCodeValue: `EVENT_XYZ_STAND_${formData.name.replace(/\s+/g, "_").toUpperCase()}_${Date.now()}`,
        imageUrl:
          formData.imageUrl || `/placeholder.svg?width=400&height=200&query=${formData.name.replace(/\s+/g, "+")}`,
      }
      setStands([...stands, newStand])
      toast({ title: "Stand Added", description: `${newStand.name} has been added.` })
    }
    setIsFormOpen(false)
    setEditingStand(null)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Stand Management</h1>
        <Button onClick={handleAddStand}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Stand
        </Button>
      </div>

      <StandFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        stand={editingStand}
        allProducts={mockProducts}
        onClose={() => {
          setIsFormOpen(false)
          setEditingStand(null)
        }}
      />

      <QrCodeDialog
        stand={viewingQrStand}
        isOpen={!!viewingQrStand}
        onOpenChange={(isOpen) => {
          if (!isOpen) setViewingQrStand(null)
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Stands</CardTitle>
          <CardDescription>Manage your event distribution points. View, edit, or generate QR codes.</CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Search stands by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStands.map((stand) => (
                <React.Fragment key={stand.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedStandId(expandedStandId === stand.id ? null : stand.id)}
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", expandedStandId === stand.id && "rotate-180")}
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{stand.name}</TableCell>
                    <TableCell>{stand.location}</TableCell>
                    <TableCell>
                      {stand.stock.length > 0 ? (
                        <Badge variant="secondary">{stand.stock.length} products</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No products</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingQrStand(stand)}>
                            <QrCodeIcon className="mr-2 h-4 w-4" /> View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStand(stand)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Stand
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteStand(stand.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Stand
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedStandId === stand.id && (
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1">
                            <Image
                              src={stand.imageUrl || "/placeholder.svg?width=400&height=200&query=stand"}
                              alt={`Image of ${stand.name}`}
                              width={400}
                              height={200}
                              className="rounded-lg object-cover aspect-video"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">{stand.description || "No description."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center">
                                  <Clock className="mr-2 h-4 w-4" /> Operating Hours
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {stand.operatingHours || "Not specified"}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center">
                                  <User className="mr-2 h-4 w-4" /> Contact Person
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {stand.contactPerson || "Not specified"}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center">
                                  <Phone className="mr-2 h-4 w-4" /> Contact Phone
                                </h4>
                                <p className="text-sm text-muted-foreground">{stand.contactPhone || "Not specified"}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Stock Details</h4>
                              <div className="space-y-1">
                                {stand.stock.map((s) => (
                                  <div key={s.productId} className="flex justify-between text-sm">
                                    <span>{s.productName}</span>
                                    <span className="font-mono">
                                      {s.assignedQuantity - s.deliveredQuantity}/{s.assignedQuantity}
                                    </span>
                                  </div>
                                ))}
                                {stand.stock.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No products assigned.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filteredStands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No stands found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredStands.length}</strong> of <strong>{stands.length}</strong> stands.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

interface StandFormDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (data: Omit<Stand, "id" | "qrCodeValue" | "stock"> & { id?: string; stock: StandStock[] }) => void
  stand: Stand | null
  allProducts: Product[]
  onClose: () => void
}

function StandFormDialog({ isOpen, onOpenChange, onSubmit, stand, allProducts, onClose }: StandFormDialogProps) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [assignedStock, setAssignedStock] = useState<StandStock[]>([])

  React.useEffect(() => {
    if (stand) {
      setName(stand.name)
      setLocation(stand.location)
      setDescription(stand.description || "")
      setOperatingHours(stand.operatingHours || "")
      setImageUrl(stand.imageUrl || "")
      setContactPerson(stand.contactPerson || "")
      setContactPhone(stand.contactPhone || "")
      setAssignedStock(stand.stock.map((s) => ({ ...s })))
    } else {
      setName("")
      setLocation("")
      setDescription("")
      setOperatingHours("")
      setImageUrl("")
      setContactPerson("")
      setContactPhone("")
      setAssignedStock([])
    }
  }, [stand, isOpen])

  const handleStockChange = (productId: string, productName: string, quantity: number) => {
    setAssignedStock((prevStock) => {
      const existing = prevStock.find((s) => s.productId === productId)
      if (existing) {
        return prevStock.map((s) => (s.productId === productId ? { ...s, assignedQuantity: quantity, productName } : s))
      }
      return [...prevStock, { productId, productName, assignedQuantity: quantity, deliveredQuantity: 0 }]
    }).filter((s) => s.assignedQuantity > 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: stand?.id,
      name,
      location,
      description,
      operatingHours,
      imageUrl,
      contactPerson,
      contactPhone,
      stock: assignedStock,
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stand ? "Edit Stand" : "Add New Stand"}</DialogTitle>
          <DialogDescription>
            {stand
              ? "Update the details of this stand."
              : "Fill in the details for the new stand and assign product stock."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stand-name">Name</Label>
                <Input id="stand-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stand-location">Location</Label>
                <Input id="stand-location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stand-description">Description</Label>
                <Textarea
                  id="stand-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of the stand..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stand-hours">Operating Hours</Label>
                <Input
                  id="stand-hours"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g., 9:00 AM - 8:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stand-image">Image URL (Optional)</Label>
                <Input
                  id="stand-image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stand-contact-person">Contact Person</Label>
                  <Input
                    id="stand-contact-person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stand-contact-phone">Contact Phone</Label>
                  <Input
                    id="stand-contact-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Assign Product Stock</Label>
              <ScrollArea className="h-[420px] mt-2 border rounded-md p-2">
                {allProducts.map((product) => {
                  const currentAssignment = assignedStock.find((s) => s.productId === product.id)
                  const productMaxAssignable =
                    product.totalQuantity - product.assignedToStands + (currentAssignment?.assignedQuantity || 0)

                  return (
                    <div key={product.id} className="grid grid-cols-3 items-center gap-2 mb-2">
                      <Label htmlFor={`stock-${product.id}`} className="col-span-1 truncate" title={product.name}>
                        {product.name}
                      </Label>
                      <Input
                        id={`stock-${product.id}`}
                        type="number"
                        min="0"
                        max={productMaxAssignable}
                        value={currentAssignment?.assignedQuantity || 0}
                        onChange={(e) => handleStockChange(product.id, product.name, Number.parseInt(e.target.value))}
                        className="col-span-2"
                      />
                      <small className="col-span-3 text-xs text-muted-foreground text-right -mt-1">
                        Available to assign: {productMaxAssignable}
                      </small>
                    </div>
                  )
                })}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{stand ? "Save Changes" : "Add Stand"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface QrCodeDialogProps {
  stand: Stand | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

function QrCodeDialog({ stand, isOpen, onOpenChange }: QrCodeDialogProps) {
  if (!stand) return null

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${stand.name.replace(/\s+/g, "_")}_QR.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {stand.name}</DialogTitle>
          <DialogDescription>Scan this QR code at the event stand. Location: {stand.location}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <QRCodeCanvas id="qr-code-canvas" value={stand.qrCodeValue} size={256} level="H" includeMargin={true} />
          <p className="mt-2 text-xs text-muted-foreground break-all">Value: {stand.qrCodeValue}</p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={downloadQR}>
            Download QR
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
