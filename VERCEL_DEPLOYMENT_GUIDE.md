# Vercel Deployment Guide for Supabase Integration

## 🚨 **Common Issues & Solutions**

### 1. **Environment Variables Not Set**
**Problem**: Supabase connection fails because environment variables are missing in Vercel.

**Solution**:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Make sure to select **Production**, **Preview**, and **Development** environments
5. Redeploy your application

### 2. **CORS Issues**
**Problem**: Browser blocks requests to Supabase due to CORS policy.

**Solution**:
- ✅ **Fixed**: Added proper headers in `next.config.mjs`
- ✅ **Fixed**: Created root `middleware.ts` for proper request handling

### 3. **Supabase Project Configuration**
**Problem**: Supabase project settings not configured for production domain.

**Solution**:
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** → **URL Configuration**
3. Add your Vercel domain to **Site URL**:
   ```
   https://your-app.vercel.app
   ```
4. Add redirect URLs:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/dashboard
   ```

### 4. **Database Connection Issues**
**Problem**: Database queries fail in production.

**Solution**:
- ✅ **Fixed**: Added error handling and logging in services
- ✅ **Fixed**: Added environment variable validation

## 🔧 **Deployment Checklist**

### Before Deployment
- [ ] Environment variables set in Vercel
- [ ] Supabase project URL configuration updated
- [ ] Database schema deployed to Supabase
- [ ] RLS policies configured correctly

### After Deployment
- [ ] Check Vercel function logs for errors
- [ ] Verify environment variables are loaded
- [ ] Test database connections
- [ ] Check browser console for CORS errors

## 🐛 **Debugging Steps**

### 1. **Check Environment Variables**
Add the debug component temporarily to your layout:

```tsx
import { DebugEnv } from '@/components/debug-env'

// In your layout or page
<DebugEnv />
```

### 2. **Check Vercel Function Logs**
1. Go to Vercel dashboard
2. Navigate to **Functions** tab
3. Check for any error logs
4. Look for environment variable issues

### 3. **Browser Console Debugging**
1. Open browser developer tools
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests
4. Look for CORS errors or 401/403 responses

### 4. **Supabase Dashboard Debugging**
1. Go to Supabase dashboard
2. Check **Logs** → **API** for failed requests
3. Check **Authentication** → **Users** for auth issues
4. Check **Database** → **Logs** for query errors

## 🔧 **Quick Fixes**

### If Environment Variables Are Missing
```bash
# Add to Vercel environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### If CORS Issues Persist
Check that your Supabase project has the correct site URL:
```
https://your-app.vercel.app
```

### If Database Queries Fail
1. Check RLS policies in Supabase
2. Verify table permissions
3. Check if user is authenticated properly

## 📞 **Support**

If issues persist:
1. Check Vercel deployment logs
2. Check Supabase project logs
3. Verify all environment variables are set
4. Test with a simple query first

## 🎯 **Expected Behavior After Fixes**

- ✅ Environment variables load correctly
- ✅ Supabase client initializes without errors
- ✅ Database queries execute successfully
- ✅ Authentication works properly
- ✅ No CORS errors in browser console
- ✅ Sales data loads and displays correctly 