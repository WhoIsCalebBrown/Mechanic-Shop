# Admin Panel - Customizable Landing Page

## Overview

This mechanic shop application now includes a fully customizable admin panel that allows shop owners to personalize their customer-facing landing page. This makes the application perfect for selling to multiple local mechanics, as each shop can customize the site to match their brand without any coding.

## Features

### 1. **Customer-Facing Landing Page** (`/`)
- Modern, motorsport-inspired design
- Fully responsive (mobile, tablet, desktop)
- Scroll animations and smooth transitions
- Sections include:
  - Hero section with customizable title and CTAs
  - Statistics showcase (vehicles serviced, satisfaction rate, years experience)
  - Three customizable service offerings
  - Four "Why Choose Us" features
  - Call-to-action section
  - Contact information footer

### 2. **Admin Settings Panel** (`/admin/settings`)
- Tabbed interface for easy navigation:
  - **Business Info**: Name, address, phone, email, hours
  - **Hero Section**: Main title, subtitle, button text
  - **Statistics**: Customize the three stat numbers
  - **Services**: Three services with title, description, and 4 features each
  - **Why Choose Us**: Four features with titles and descriptions
  - **Call to Action**: Customizable CTA section

### 3. **Backend API**
- RESTful API endpoints for site settings
- Automatic default settings creation
- Partial updates (only send changed fields)

## How to Use

### For Shop Owners (Customizing the Site)

1. **Access the Admin Panel**
   - Navigate to `/admin/settings` or click "Site Settings" in the dashboard navigation

2. **Update Business Information**
   - Click the "Business Info" tab
   - Enter your shop name, address, contact info
   - Set your operating hours
   - Click "Save Changes"

3. **Customize Hero Section**
   - Click "Hero Section" tab
   - Update the main headline (use `\n` for line breaks)
   - Change subtitle and button text
   - Click "Save Changes"

4. **Update Statistics**
   - Click "Statistics" tab
   - Enter your shop's numbers (vehicles serviced, satisfaction %, years in business)
   - Click "Save Changes"

5. **Customize Services**
   - Click "Services" tab
   - For each of the three services:
     - Update title and description
     - List 4 key features/inclusions
   - Click "Save Changes"

6. **Set "Why Choose Us" Features**
   - Click "Why Choose Us" tab
   - Customize all four differentiators
   - Click "Save Changes"

7. **Preview Your Changes**
   - Click "Preview Landing Page" to open the customer-facing site in a new tab
   - All changes are immediately reflected

### For Developers (Technical Details)

#### API Endpoints

**GET** `/api/sitesettings`
- Retrieves current site settings
- Creates default settings if none exist
- Returns: `SiteSettingsDto`

**PUT** `/api/sitesettings`
- Updates site settings (partial updates supported)
- Accepts: `UpdateSiteSettingsDto`
- Returns: Updated `SiteSettingsDto`

#### Database Schema

The `SiteSettings` table includes all customizable content fields:
- Business information (name, address, contact)
- Hours of operation
- Statistics (3 numbers)
- Hero section content
- Service details (3 services × 6 fields each)
- Why Choose Us features (4 features × 2 fields each)
- CTA section content

#### Running Migrations

If you have .NET EF tools installed:
```bash
cd MechanicShopAPI
dotnet ef database update
```

The migration file is located at:
`MechanicShopAPI/Migrations/20251028000000_AddSiteSettings.cs`

#### Frontend Routes

- `/` - Public landing page (no auth required)
- `/dashboard` - Staff dashboard
- `/admin/settings` - Admin panel for customization
- `/customers`, `/vehicles`, `/appointments`, `/service-records` - Management pages

## Color Scheme

The site uses the existing Audi-inspired color palette:
- **Audi Red** (`#f50538`) - Primary accent, CTAs
- **Black/Dark Gray** - Backgrounds, text
- **White/Light Gray** - Text, cards, sections
- **Gray tones** - Secondary elements

## Selling Points for Local Mechanics

1. **No Coding Required** - Everything customizable through admin panel
2. **Professional Design** - Modern, motorsport-inspired aesthetic
3. **Fully Responsive** - Works perfectly on all devices
4. **Easy Updates** - Change content anytime without developer help
5. **Comprehensive** - Manage customers, vehicles, appointments, and services
6. **Customer-Facing** - Professional landing page to attract new clients
7. **Staff Portal** - Separate dashboard for internal management

## Future Enhancements (Optional)

- [ ] Image upload for logo and hero background
- [ ] Gallery section for showcasing work
- [ ] Testimonials/reviews section
- [ ] Online booking integration
- [ ] Multi-language support
- [ ] Theme/color customization
- [ ] Email template customization
- [ ] Analytics dashboard

## Support

For technical support or feature requests, contact the development team.

---

**Version:** 1.0
**Last Updated:** October 28, 2025
