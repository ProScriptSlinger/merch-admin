# QR Code Integration with Supabase

This document describes the QR code integration implemented in the merch-admin application, including scanning, generation, and database integration.

## Overview

The QR code system allows users to:
- Scan QR codes to retrieve order information from Supabase
- Generate QR codes for orders
- Update order status through QR scanning
- Manage order delivery and cancellation

## Components

### 1. QR Scanner (`app/dashboard/scan/page.tsx`)

The main scanning page that integrates with Supabase and uses `react-qr-reader-es6` for camera-based QR scanning.

**Key Features:**
- Real-time QR code scanning using device camera
- Integration with Supabase to fetch order data by QR code
- Order status management (confirm delivery, cancel delivery)
- Order editing capabilities
- Loading states and error handling

**Dependencies:**
- `react-qr-reader-es6` - For camera-based QR scanning
- `@/lib/services/orders` - For Supabase order operations

### 2. QR Code Generator (`components/qr-code-generator.tsx`)

A reusable component for generating QR codes using `qrcode.react`.

**Features:**
- Generate QR codes from text input
- Download QR codes as PNG images
- Copy QR code values to clipboard
- Customizable styling and options

**Dependencies:**
- `qrcode.react` - For QR code generation

### 3. Edit Order Dialog (`app/dashboard/scan/edit-order-dialog.tsx`)

Dialog component for editing order items with real product data from Supabase.

**Features:**
- Fetch product variants from Supabase
- Add/remove order items
- Update quantities
- Real-time total calculation

## Database Integration

### Orders Table Structure

The orders table includes a `qr_code` field that stores unique QR code identifiers:

```sql
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    qr_code TEXT UNIQUE,  -- QR code identifier
    status order_status DEFAULT 'pending',
    payment_method payment_method,
    total_amount DECIMAL(10,2) NOT NULL,
    -- ... other fields
);
```

### Key Functions

#### `getOrderByQRCode(qrCode: string)`
Fetches order details by QR code from Supabase:

```typescript
export async function getOrderByQRCode(qrCode: string): Promise<OrderWithDetails | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product_variant:product_variants(
          *,
          product:products(id, name)
        )
      ),
      stand:stands(*),
      delivered_by_stand:stands!delivered_by_stand_id(*),
      user:users(*)
    `)
    .eq('qr_code', qrCode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching order by QR code: ${error.message}`)
  }

  return order
}
```

#### `updateOrder(id: string, orderData: UpdateOrderData)`
Updates order status and delivery information:

```typescript
export async function updateOrder(id: string, orderData: UpdateOrderData): Promise<OrderWithDetails> {
  const { error } = await supabase
    .from('orders')
    .update(orderData)
    .eq('id', id)

  if (error) {
    throw new Error(`Error updating order: ${error.message}`)
  }

  return getOrder(id) as Promise<OrderWithDetails>
}
```

## Usage

### 1. Scanning QR Codes

1. Navigate to `/dashboard/scan`
2. Click the "Cámara" button to start scanning
3. Point the camera at a QR code
4. The system will automatically fetch order details from Supabase
5. Review order information and take action (confirm/cancel delivery)

### 2. Generating QR Codes

1. Navigate to `/dashboard/qr-test`
2. Use the QR generator to create custom QR codes
3. Or select from demo QR codes for testing
4. Download or copy the generated QR codes

### 3. Testing with Demo Data

Run the SQL script to create demo orders:

```bash
# Execute the demo data script
psql -d your_database -f scripts/seed-demo-orders.sql
```

Demo QR codes available:
- `ORDER-QR-001` - Juan Pérez ($43,000)
- `ORDER-QR-002` - María García ($63,500)
- `ORDER-QR-003` - Carlos López ($47,500)

## QR Code Format

QR codes contain order identifiers that map to the `qr_code` field in the orders table. The format is flexible but typically follows:

```
ORDER-QR-{ORDER_ID}
```

## Error Handling

The system includes comprehensive error handling:

- **Camera Access Errors**: Displays user-friendly error messages
- **Invalid QR Codes**: Shows "QR code not found" message
- **Network Errors**: Handles Supabase connection issues
- **Loading States**: Shows loading indicators during operations

## Security Considerations

- QR codes are validated against the database before processing
- Order updates require proper authentication
- Row Level Security (RLS) policies protect order data
- QR codes are unique identifiers to prevent conflicts

## Future Enhancements

1. **QR Code Encryption**: Add encryption for sensitive order data
2. **Batch Processing**: Support for scanning multiple QR codes
3. **Offline Support**: Cache order data for offline scanning
4. **Analytics**: Track QR code usage and scanning patterns
5. **Custom QR Templates**: Allow custom QR code styling

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure HTTPS is enabled and camera permissions are granted
2. **QR codes not found**: Verify the QR code exists in the database
3. **Slow scanning**: Check camera resolution settings and lighting conditions

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG_QR = true
```

This will log QR scanning events and database operations to the console.

## Dependencies

```json
{
  "react-qr-reader-es6": "^1.0.0",
  "qrcode.react": "^3.1.0",
  "@supabase/supabase-js": "^2.50.0"
}
```

## API Endpoints

The QR system uses the following Supabase endpoints:

- `GET /orders?qr_code=eq.{qrCode}` - Fetch order by QR code
- `PATCH /orders?id=eq.{orderId}` - Update order status
- `GET /product_variants` - Fetch product data for editing

All endpoints are protected by Row Level Security (RLS) policies. 