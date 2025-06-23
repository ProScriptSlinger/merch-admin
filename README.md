# Merch Admin - Supabase Integration

A comprehensive merchandise management system built with Next.js and Supabase, featuring real-time updates, user authentication, and inventory management.

## Features

- 🔐 **Supabase Authentication** - Secure user authentication with role-based access
- 📊 **Real-time Updates** - Live data synchronization across all connected clients
- 🛍️ **Product Management** - Complete CRUD operations for products with variants
- 📦 **Inventory Control** - Stock tracking with low stock alerts
- 🏪 **Stand Management** - Assign products to different sales locations
- 📱 **QR Code Integration** - Scan and track orders
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui components
- 📈 **Sales Analytics** - Track sales and performance metrics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **UI Components**: shadcn/ui, Tailwind CSS
- **File Storage**: Vercel Blob Storage
- **State Management**: React Context API

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Vercel account (for blob storage)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd merch-admin
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy the following:
   - Project URL
   - Anon public key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL (if using direct connection)
POSTGRES_URL=your_database_connection_string

# Vercel Blob Storage (for image uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 5. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the script to create all tables, indexes, and policies

### 6. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### 7. Set Up Vercel Blob Storage (Optional)

For image uploads, you can use Vercel Blob Storage:

1. Create a Vercel account
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel link` in your project
4. Create a blob store: `vercel blob create`
5. Copy the token to your `.env.local`

### 8. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **users** - User profiles and authentication
- **categories** - Product categories
- **products** - Product information
- **product_variants** - Product sizes and stock
- **product_images** - Product images
- **stands** - Sales locations
- **stand_stock** - Stock assigned to stands
- **orders** - Customer orders
- **order_items** - Items in orders
- **stock_movements** - Stock movement history

## Authentication & Authorization

The app implements role-based access control:

- **Admin** - Full access to all features
- **Manager** - Can manage products, orders, and stands
- **Staff** - Can view data and process orders

## Real-time Features

The application uses Supabase Realtime for:

- Live product updates
- Real-time order status changes
- Instant stock level updates
- Live notifications

## API Routes

The application includes the following API routes:

- `/api/upload` - Image upload endpoint
- All other data operations use Supabase client directly

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
BLOB_READ_WRITE_TOKEN=your_production_blob_token
```

## Project Structure

```
merch-admin/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── contexts/             # React context providers
├── lib/                  # Utility functions and services
│   ├── services/         # Supabase service functions
│   └── supabase.ts       # Supabase client configuration
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
