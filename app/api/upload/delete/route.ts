import { NextResponse } from "next/server"
import { deleteFromStorage } from "@/lib/storage"

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ message: "No se proporcionó la ruta del archivo." }, { status: 400 })
    }

    // Delete from Supabase storage using the utility function
    const result = await deleteFromStorage(filePath)

    if (result.success) {
      return NextResponse.json({ 
        message: "Archivo eliminado correctamente.",
        success: true 
      })
    } else {
      return NextResponse.json({ 
        message: "Error al eliminar el archivo.",
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { 
        message: "Error interno del servidor.",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
} 