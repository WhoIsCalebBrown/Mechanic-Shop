# Troubleshooting Guide - White Screen / Loading Issues

## Problem
You're seeing either a white screen or "Loading..." message when accessing the site.

## Root Cause
The SiteSettings table hasn't been created in the database yet, causing the API to fail when the landing page tries to fetch settings.

## Solution

### Step 1: Stop the Backend
In the terminal where your backend is running (the one with `dotnet run`):
1. Press `Ctrl+C` to stop the server

### Step 2: Restart with Auto-Migration
The code has been updated to automatically create the database table on startup.

In the MechanicShopAPI directory, run:
```bash
cd /home/caleb/Code/Mechanic-Shop/MechanicShopAPI
dotnet run
```

You should see the app start normally. The SiteSettings table will be created automatically.

### Step 3: Verify API is Working
Open a new terminal and test the API:
```bash
curl http://localhost:5000/api/sitesettings
```

You should get a JSON response with default settings.

### Step 4: Refresh the Browser
Go to http://localhost:5173/ and refresh the page. The landing page should now load with default content.

---

## Quick Restart Script
Alternatively, you can use the provided script:
```bash
./RESTART_BACKEND.sh
```

---

## What Was Fixed

1. **Added Auto-Migration** in `Program.cs`:
   ```csharp
   using (var scope = app.Services.CreateScope())
   {
       var db = scope.ServiceProvider.GetRequiredService<MechanicShopContext>();
       db.Database.EnsureCreated(); // Creates all tables
   }
   ```

2. **Database Table**: The `SiteSettings` table will be created with default values

---

## Testing Each Page

### 1. Landing Page (/)
Should show:
- Hero section with "PRECISION AUTOMOTIVE CARE"
- Stats section (5000 vehicles, 98% satisfaction, 25 years)
- Three service cards
- Why Choose Us features
- Call-to-action section
- Footer with contact info

### 2. Dashboard (/dashboard)
Your existing dashboard with stats

### 3. Admin Settings (/admin/settings)
Should show:
- Tabbed interface (Business Info, Hero Section, etc.)
- Forms to edit all content
- Save button
- Preview link

---

## Common Issues & Fixes

### Issue: "Loading..." Never Goes Away
**Cause**: API not responding
**Fix**: Check backend console for errors, ensure it's running on port 5000

### Issue: 404 Error on API
**Cause**: Backend not running or wrong port
**Fix**:
```bash
# Check if backend is running
ps aux | grep dotnet

# If not running, start it
cd MechanicShopAPI
dotnet run
```

### Issue: CORS Error in Browser Console
**Cause**: CORS policy not allowing frontend
**Fix**: Already configured in `Program.cs`, but verify frontend is on port 5173

### Issue: TypeScript Compilation Errors
**Cause**: Missing dependencies
**Fix**:
```bash
cd frontend
npm install
npm run dev
```

---

## Verifying Everything Works

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/api/customers
   curl http://localhost:5000/api/sitesettings
   ```

2. **Frontend Access**:
   - Open http://localhost:5173/
   - Should see landing page (not loading)

3. **Admin Panel**:
   - Navigate to http://localhost:5173/admin/settings
   - Should see tabbed interface with forms

4. **Save Settings**:
   - Edit any field in admin panel
   - Click "Save Changes"
   - Click "Preview Landing Page"
   - Verify changes appear

---

## Database Location
The SQLite database is located at:
```
/home/caleb/Code/Mechanic-Shop/MechanicShopAPI/mechanicshop.db
```

If you want to inspect it manually (requires sqlite3):
```bash
sqlite3 mechanicshop.db
.tables  # Show all tables
SELECT * FROM SiteSettings;  # View settings
.quit
```

---

## Need More Help?

Check the browser console (F12) for specific error messages and include them when asking for help.
