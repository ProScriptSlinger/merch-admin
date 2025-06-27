import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateQRCode(): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substr(2, 9)
  return `QR-${timestamp}-${randomSuffix}`
}
