# LT's Business Website - Administrator Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Admin Dashboard](#admin-dashboard)
4. [Managing Orders](#managing-orders)
5. [Product Management](#product-management)
6. [Customer Management](#customer-management)
7. [Analytics and Reports](#analytics-and-reports)
8. [Content Management](#content-management)
9. [Technical Information](#technical-information)
10. [Troubleshooting](#troubleshooting)

## Introduction

Welcome to the LT's Business Website Administrator Guide. This comprehensive document will help you navigate and manage all aspects of the LT's Business e-commerce platform. The website is designed to showcase custom business apparel and promotional products with a focus on embroidery services based in Maine.

The system has been developed using Next.js, a modern React framework, with a focus on performance, SEO, and user experience. This guide will walk you through all administrative functions.

## Getting Started

### Accessing the Admin Panel

1. Navigate to the website URL and add `/admin` to the end (e.g., `https://your-domain.com/admin`).
2. Enter the administrator password (default: `admin123`).
3. For security reasons, please change this password after your first login.

### Changing Admin Password

1. Currently, the password is stored in local browser storage for demonstration purposes.
2. In a production environment, this would be connected to a secure authentication system.
3. To change the password, contact the development team who can update the authentication system.

## Admin Dashboard

### Dashboard Overview

The dashboard provides a quick overview of:
- Total Orders
- Total Revenue
- Total Customers
- Pending Orders
- Recent Orders (last 5)
- Top Products by Revenue

### Navigation

The admin panel includes navigation to the following sections:
- Dashboard (home)
- Orders
- Products
- Customers
- Emails
- Analytics
- Settings

Each section has specific functionality related to its area of concern.

## Managing Orders

### Order Listings

1. Navigate to the **Orders** section from the sidebar.
2. View all orders with basic information including:
   - Order ID
   - Customer Name
   - Order Date
   - Total Amount
   - Order Status

### Order Details

1. Click on any order to view detailed information including:
   - Customer Information
   - Shipping Address
   - Order Items with quantities and prices
   - Order Totals (subtotal, shipping, tax, discounts)
   - Payment Information
   - Order Notes

### Order Management

1. **Changing Order Status**: Use the dropdown to change the status to one of the following:
   - Confirmed (initial status)
   - Proof (design proof sent)
   - In Production
   - Shipped
   - Delivered
   - Cancelled
   - Returned

2. **Adding Order Notes**: Use the text area to add notes to the order, which are visible internally.

3. **Processing Returns/Refunds**: Use the dedicated form to process returns and refunds, specifying the reason and amount.

## Product Management

### Product Listings

1. Navigate to the **Products** section from the sidebar.
2. View all products with basic information including:
   - Product Name
   - Price
   - Category
   - Inventory Status
   - Featured/New Status

### Adding a New Product

1. Click "Add New Product" button.
2. Fill in the required fields:
   - Product Name
   - Description
   - Price
   - Category and Subcategory
   - Available Colors (multi-select)
   - Available Sizes (multi-select)
   - Inventory Quantity
   - Featured Status (checkbox)
   - New Arrival Status (checkbox)

3. **Adding Product Images**:
   - Upload main product image
   - Add additional images for gallery view (optional)

### Editing Existing Products

1. Click on the "Edit" button next to any product.
2. Modify any of the fields as needed.
3. Click "Save Changes" to update the product information.

### Managing Product Inventory

1. Quick inventory updates can be made from the product listing page.
2. Bulk inventory updates can be made by uploading a CSV file.

## Customer Management

### Customer Segmentation

The system automatically segments customers into different categories:

1. **VIP Customers**: High-value repeat customers
2. **Loyal Customers**: Regular purchasers
3. **Promising Customers**: New customers with strong initial engagement
4. **New Customers**: First-time buyers
5. **At-Risk Customers**: Previous customers who haven't purchased recently
6. **Dormant Customers**: Long-time inactive customers
7. **Lost Customers**: Previous customers who haven't returned in a very long time

### Customer Profiles

1. Navigate to the **Customers** section from the sidebar.
2. View customer information including:
   - Contact Information
   - Order History
   - Total Spend
   - Customer Score (0-100)
   - Segment Category
   - Tags
   - Favorite Product Categories

### Communication Tools

1. **Email Exports**: Export email lists for different customer segments for use in external email marketing tools.
2. **Direct Messaging**: Send direct messages to individual customers through the system.

## Analytics and Reports

### Overview

The Analytics section provides comprehensive data visualization for business performance.

### Available Reports

1. **Sales Reports**:
   - Daily/Weekly/Monthly/Yearly Sales Trends
   - Sales by Product Category
   - Sales by Customer Segment

2. **Product Performance**:
   - Best Selling Products
   - Product Category Performance
   - Inventory Turnover Rates

3. **Customer Insights**:
   - New vs. Returning Customer Revenue
   - Customer Lifetime Value
   - Acquisition Channel Performance

4. **Marketing Effectiveness**:
   - Promotional Code Usage
   - Email Campaign Performance
   - Conversion Rates

### Exporting Data

1. All reports can be exported as CSV files for further analysis.
2. Scheduled reports can be set up for automatic delivery to specified email addresses.

## Content Management

### Homepage Content

While direct content editing is not built into the admin panel, contact the development team to update:
- Hero Section Content and Images
- Featured Products
- Testimonials
- Custom Banners and Promotions

### Product Categories

Product categories and subcategories can be managed through the Products section.

## DecoNetwork Integration

### Overview

LT's Business website is integrated with DecoNetwork, a professional decoration management system that enables customers to personalize products with their own logos and designs. This integration provides:

1. **Online Design Tool**: Allows customers to upload logos, add text, and customize products directly on the website
2. **Live Price Quoting**: Automatically calculates customization costs based on design complexity and quantity
3. **Order Management**: Sends customization details directly to production
4. **Design Preview**: Shows customers a preview of their customized product

### Configuration

The DecoNetwork integration is configured through environment variables:

```
NEXT_PUBLIC_DECO_API_URL=https://api.deconetwork.com
DECO_API_KEY=your_api_key_here
DECO_STORE_ID=lts_business
```

These variables need to be set in the deployment environment to ensure proper communication with the DecoNetwork API.

### Customer Experience

Customers can customize products through the following process:

1. **Product Selection**: Customer browses and selects a product
2. **Customization Initiation**: On the product page, customer clicks "Start Customizing"
3. **Design Tool**: A DecoNetwork design interface opens in a popup window or overlay
4. **Design Creation**: Customer uploads logos, adds text, selects colors, and positions elements
5. **Design Review**: Customer reviews design and price quote
6. **Add to Cart**: Custom design is saved and added to cart

### Administration

As an administrator, you can manage customized orders through:

1. **DecoNetwork Dashboard**: Access your DecoNetwork account to view detailed customization information
2. **Order Management**: In the admin panel, customized orders are flagged with a special indicator
3. **Production Files**: Artwork files are automatically available in the DecoNetwork system
4. **Status Updates**: Customization production status can be managed and tracked

### Customization Pricing

The system automatically calculates prices based on:

1. Base product price
2. Decoration method (embroidery, screen printing, etc.)
3. Number of colors or complexity of design
4. Quantity ordered
5. Special production requirements

### Maintenance

Regular maintenance of the DecoNetwork integration includes:

1. **API Key Rotation**: Change your API key periodically for security
2. **Design Template Updates**: Update available design templates seasonally
3. **Pricing Synchronization**: Ensure pricing rules are synchronized between systems
4. **Testing**: Periodically test the customization flow to ensure it's working correctly

For technical support with DecoNetwork integration, contact the development team or DecoNetwork support directly.

## Technical Information

### System Architecture

- **Frontend**: Next.js (React Framework)
- **UI Components**: Shadcn UI components
- **State Management**: React Context for cart, auth, wishlist
- **Data Storage**: Currently using browser localStorage for demonstration
- **Deployment**: Netlify

### Local Development and Testing

The site can be run in two different modes:

1. **Development Mode** (Recommended for local testing):
   ```bash
   cd lts-business
   bun install  # Install dependencies if needed
   bun --bun run dev  # Start the development server
   ```
   This will start a development server on http://localhost:3000 with hot reloading enabled.

2. **Production Build** (For pre-deployment testing):
   ```bash
   cd lts-business
   bun install  # Install dependencies if needed
   bun run build  # Build the optimized production version
   bun run start  # Start the production server
   ```

**Note**: In the Same environment, the development server typically works better for previewing the site.

### Deployment Instructions

To deploy updates to this site:

1. Ensure you have the necessary dependencies installed:
   ```bash
   bun install
   ```

2. Build the project:
   ```bash
   bun run build
   ```

3. Deploy to Netlify:
   - If using Netlify CLI:
     ```bash
     netlify deploy --prod
     ```
   - Alternatively, connect your GitHub repository to Netlify for automatic deployments on push

4. Verify deployment and check for any runtime issues in the Netlify dashboard

### Data Backup

In a production environment, regular data backups would be implemented. The current demonstration version uses browser storage, which is not persistent across different devices.

## Troubleshooting

### Common Issues

1. **Order Not Showing**: Refresh the browser and check internet connection.
2. **Session Timeout**: Log in again if your session has expired.
3. **Data Not Saving**: Ensure you have clicked the Save button and received confirmation.

### Support Contact

For technical issues, please contact:
- Email: support@ltsportland.com
- Phone: 207-774-1104

---

## Quick Reference Card

### Admin Login
URL: yourdomain.com/admin
Default Password: admin123

### Key Functions
- View Orders: Admin > Orders
- Add Product: Admin > Products > Add New Product
- View Customer Data: Admin > Customers
- Export Emails: Admin > Customers > Export Emails
- View Analytics: Admin > Analytics

### Status Codes
- Confirmed: New order received
- Proof: Design proof sent to customer
- In Production: Order being produced
- Shipped: Order has been shipped
- Delivered: Order confirmed delivered
- Cancelled: Order cancelled by customer or admin
- Returned: Products returned by customer
