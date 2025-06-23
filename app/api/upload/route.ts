import { NextResponse } from "next/server"
import { uploadToStorage } from "@/lib/storage"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename || !request.body) {
      return NextResponse.json({ message: "No se proporcionó un nombre de archivo." }, { status: 400 })
    }

    // Get the file buffer from the request body
    const fileBuffer = await request.arrayBuffer()
    console.log('file buffer ----->', fileBuffer)
    // Upload to Supabase storage using the utility function
    const result = await uploadToStorage(fileBuffer, filename)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { 
        message: "Error interno del servidor.",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
