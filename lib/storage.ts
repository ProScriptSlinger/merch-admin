import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)

export interface UploadResult {
  url: string
  path: string
  success: boolean
}

export interface DeleteResult {
  success: boolean
  error?: string
}

/**
 * Upload a file to Supabase storage bucket 'merch'
 */
export async function uploadToStorage(
  file: File | ArrayBuffer, 
  filename: string
): Promise<UploadResult> {
  try {
    // Generate a unique filename to avoid conflicts
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}_${filename}`
    
    // Convert File to ArrayBuffer if needed
    const fileBuffer = file instanceof File ? await file.arrayBuffer() : file
    
    // Upload to Supabase storage bucket 'merch'
    const { data, error } = await supabase.storage
      .from('merch')
      .upload(uniqueFilename, fileBuffer, {
        contentType: 'image/*',
        cacheControl: '3600',
        upsert: false
      })
    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Error al subir la imagen: ${error.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('merch')
      .getPublicUrl(uniqueFilename)

    return {
      url: urlData.publicUrl,
      path: uniqueFilename,
      success: true
    }

  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase storage bucket 'merch'
 */
export async function deleteFromStorage(filePath: string): Promise<DeleteResult> {
  try {
    const { error } = await supabase.storage
      .from('merch')
      .remove([filePath])

    if (error) {
      console.error('Supabase delete error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Extract file path from Supabase storage URL
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    // Supabase storage URLs typically look like:
    // https://[project].supabase.co/storage/v1/object/public/merch/filename.jpg
    const urlParts = url.split('/')
    const bucketIndex = urlParts.findIndex(part => part === 'merch')
    
    if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
      return urlParts.slice(bucketIndex + 1).join('/')
    }
    
    return null
  } catch (error) {
    console.error('Error extracting file path from URL:', error)
    return null
  }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('merch')
    .getPublicUrl(filePath)
  
  return data.publicUrl
} 