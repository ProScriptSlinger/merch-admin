# Supabase Storage Setup

This document explains how to set up and use Supabase storage for image uploads in the merch admin application.

## Storage Bucket Setup

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the bucket name to `merch`
5. Make sure **Public bucket** is checked (so images can be accessed publicly)
6. Click **Create bucket**

### 2. Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

#### For Uploads (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'merch');
```

#### For Downloads (SELECT)
```sql
CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'merch');
```

#### For Deletes (DELETE)
```sql
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'merch');
```

### 3. Environment Variables

Make sure you have these environment variables set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## API Endpoints

### Upload Image
- **URL**: `/api/upload`
- **Method**: `POST`
- **Query Parameters**: `filename` (required)
- **Body**: File data
- **Response**: 
```json
{
  "url": "https://[project].supabase.co/storage/v1/object/public/merch/filename.jpg",
  "path": "filename.jpg",
  "success": true
}
```

### Delete Image
- **URL**: `/api/upload/delete`
- **Method**: `DELETE`
- **Query Parameters**: `path` (required) - the file path in storage
- **Response**:
```json
{
  "message": "Archivo eliminado correctamente.",
  "success": true
}
```

## Usage in Components

### Uploading Images
```typescript
const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
  method: "POST",
  body: file,
})

const result = await response.json()
const imageUrl = result.url
```

### Deleting Images
```typescript
const response = await fetch(`/api/upload/delete?path=${encodeURIComponent(filePath)}`, {
  method: 'DELETE',
})
```

## Storage Utility Functions

The application includes utility functions in `lib/storage.ts`:

- `uploadToStorage(file, filename)` - Upload a file to storage
- `deleteFromStorage(filePath)` - Delete a file from storage
- `extractFilePathFromUrl(url)` - Extract file path from storage URL
- `getPublicUrl(filePath)` - Get public URL for a file

## File Naming Convention

Files are automatically renamed with a timestamp prefix to avoid conflicts:
- Original: `product-image.jpg`
- Stored as: `1703123456789_product-image.jpg`

## Security Considerations

1. **File Type Validation**: Only image files are accepted (`image/*` content type)
2. **File Size Limits**: Consider implementing file size limits in your application
3. **Access Control**: Only authenticated users can upload/delete files
4. **Public Access**: Images are publicly accessible for display purposes

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check that your storage policies are correctly configured
2. **File not found**: Verify the file path is correct
3. **Upload fails**: Ensure the bucket exists and is named `merch`
4. **CORS errors**: Make sure your Supabase project allows requests from your domain

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test storage policies in Supabase dashboard
4. Check file permissions and bucket settings

## Migration from Vercel Blob

If you're migrating from Vercel Blob:

1. Remove `@vercel/blob` dependency from `package.json`
2. Update any direct Vercel Blob API calls to use the new Supabase endpoints
3. Update image URLs in your database to point to Supabase storage URLs
4. Test upload and delete functionality thoroughly 