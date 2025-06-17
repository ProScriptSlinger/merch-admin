import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename || !request.body) {
    return NextResponse.json({ message: "No se proporcionó un nombre de archivo." }, { status: 400 })
  }

  // El cuerpo de la solicitud (request.body) es el archivo en sí.
  const blob = await put(filename, request.body, {
    access: "public", // Es crucial que sea público para que se pueda ver la imagen
  })

  return NextResponse.json(blob)
}
