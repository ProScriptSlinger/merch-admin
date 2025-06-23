"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct } from "@/lib/services/products";
import type { ProductWithDetails } from "@/lib/services/products";

interface ProductsTableProps {
  products: ProductWithDetails[];
  onAssignStock: (product: ProductWithDetails) => void;
  onEdit: (product: ProductWithDetails) => void;
}

export default function ProductsTable({
  products,
  onAssignStock,
  onEdit,
}: ProductsTableProps) {
  const { toast } = useToast();

  const handleDelete = async (productId: string, productName: string) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast({
        title: "Éxito",
        description: `Producto "${productName}" eliminado correctamente.`,
      });
      // The parent component will handle refreshing the data
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el producto",
        variant: "destructive",
      });
    }
  };

  if (!products || products.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center">
        No se encontraron productos.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">
            Imagen
          </TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Tallas y Stock</TableHead>
          <TableHead className="text-center">Stock Total</TableHead>
          <TableHead className="text-center">Precios</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const totalStock = product.total_quantity;
          const availableVariants = product.variants.filter(
            (v) => v.quantity > 0
          );
          const isLowStock =
            product.low_stock_threshold !== null &&
            totalStock <= product.low_stock_threshold;

          return (
            <TableRow key={product.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt={product.name}
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={
                    product.images.find(img => img.is_primary)?.image_url ||
                    product.images[0]?.image_url ||
                    `/placeholder.svg?width=64&height=64&query=${encodeURIComponent(
                      product.name
                    )}`
                  }
                  width="64"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category?.name || "N/A"}</TableCell>
              <TableCell>
                {availableVariants.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {availableVariants.map((v) => (
                      <Badge key={v.size} variant="outline" className="text-xs">
                        {v.size}: {v.quantity}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin stock
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center font-mono">
                {totalStock}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {product.variants.slice(0, 3).map((v) => (
                    <Badge key={v.size} variant="secondary" className="text-xs">
                      {v.size}: ${v.price}
                    </Badge>
                  ))}
                  {product.variants.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.variants.length - 3} más
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {totalStock === 0 ? (
                  <Badge variant="destructive">Sin Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="destructive">Stock Bajo</Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    En Stock
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    title="Editar Producto"
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                    <span className="sr-only">
                      Editar {product.name}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAssignStock(product)}
                    title="Asignar Stock a Stands"
                    disabled={totalStock === 0}
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="sr-only">
                      Asignar stock de {product.name}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDelete(product.id, product.name)
                    }
                    title="Eliminar Producto"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Eliminar {product.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
