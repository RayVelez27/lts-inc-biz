# LT's Business Website - Export, Setup & Deployment Guide

## Table of Contents

1. [Exporting from Same.new](#exporting-from-samenew)
2. [Local Development Setup](#local-development-setup)
3. [DecoNetwork Integration](#deconetwork-integration)
4. [Deployment Options](#deployment-options)
5. [Maintenance and Updates](#maintenance-and-updates)
6. [Troubleshooting](#troubleshooting)

---

## 1. Exporting from Same.new

### 1.1. Download the Project

1. **Access the Download Option**
   - Open your project in Same.new
   - Click on the "Tools" button in the top-right corner
   - Select "Download" from the dropdown menu

2. **Extract the Files**
   - Locate the downloaded ZIP file (typically named `lts-business.zip`)
   - Extract the ZIP file to your preferred location
   - Ensure the extracted folder is named `lts-business` or rename it as needed

### 1.2. Project Structure Overview

The project follows a standard Next.js structure with these key directories:

- `/src/app` - Page components and routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and context providers
- `/public` - Static assets (images, favicons, etc.)
- `/.same` - Documentation and guides

### 1.3. Understanding What You've Exported

The exported code includes:

- Complete Next.js website with all pages and components
- DecoNetwork integration for product customization
- Admin dashboard for order and product management
- Multi-language support
- Responsive design for all devices
- Comprehensive admin guides in the `.same` directory

---

## 2. Local Development Setup

### 2.1. Setting Up Your Code Editor

#### Visual Studio Code (Recommended)

1. **Install VS Code**
   - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - Complete the installation process

2. **Install Recommended Extensions**
   - ESLint: For JavaScript/TypeScript linting
   - Prettier: For code formatting
   - Tailwind CSS IntelliSense: For CSS assistance
   - TypeScript Vue Plugin (Volar): For improved TypeScript support

3. **Open the Project**
   - Open VS Code
   - Go to File → Open Folder
   - Navigate to the extracted `lts-business` folder
   - Select the folder and click "Open"

4. **Configure Editor Settings**
   - Create a `.vscode` folder in the project root (if not present)
   - Create a `settings.json` file with:
     ```json
     {
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.codeActionsOnSave": {
         "source.fixAll.eslint": true
       },
       "tailwindCSS.includeLanguages": {
         "typescript": "javascript",
         "typescriptreact": "javascript"
       }
     }
     ```

#### Other Editors

For other editors like WebStorm, Sublime Text, or Atom:
- Install relevant plugins for JavaScript, TypeScript, and React development
- Configure ESLint and Prettier integration if available
- Set up Tailwind CSS support

### 2.2. Installing Dependencies

1. **Install Node.js**
   - Download LTS version from [https://nodejs.org/](https://nodejs.org/)
   - Follow the installation instructions for your operating system

2. **Install Bun (Recommended for this project)**
   - Run `npm install -g bun` or follow instructions at [https://bun.sh/](https://bun.sh/)
   - Verify installation with `bun --version`

3. **Install Project Dependencies**
   - Open a terminal/command prompt
   - Navigate to the project directory
   - Run one of these commands:
     ```bash
     # Using Bun (recommended)
     bun install

     # Using npm
     npm install
     ```

### 2.3. Environment Configuration

1. **Create Environment File**
   - Create a new file named `.env.local` in the project root
   - Add the following environment variables:
     ```
     # DecoNetwork API Configuration
     NEXT_PUBLIC_DECO_API_URL=https://api.deconetwork.com
     DECO_API_KEY=your_api_key_here
     DECO_STORE_ID=your_store_id_here

     # Site Configuration
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```

2. **Replace Placeholder Values**
   - Update `your_api_key_here` with your actual DecoNetwork API key
   - Update `your_store_id_here` with your DecoNetwork Store ID

### 2.4. Starting the Development Server

1. **Using Bun (Recommended)**
   ```bash
   bun --bun run dev
   ```

2. **Using npm**
   ```bash
   npm run dev
   ```

3. **Access the Website**
   - Open a web browser
   - Navigate to `http://localhost:3000`
   - You should see the LT's Business website running locally

### 2.5. Version Control Setup (Optional but Recommended)

1. **Initialize Git Repository**
   ```bash
   git init
   ```

2. **Create .gitignore File**
   ```bash
   echo "node_modules\n.next\n.env.local\n.env\n*.log\nout\n.DS_Store" > .gitignore
   ```

3. **Make Initial Commit**
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

4. **Connect to Remote Repository**
   - Create a new repository on GitHub, GitLab, or Bitbucket
   - Follow their instructions to connect your local repository

---

## 3. DecoNetwork Integration

### 3.1. DecoNetwork Account Setup

1. **Create/Access Your DecoNetwork Account**
   - Sign up at [DecoNetwork's website](https://www.deconetwork.com) if you don't have an account
   - Choose an appropriate subscription plan that includes API access

2. **Obtain API Credentials**
   - Log in to your DecoNetwork account
   - Navigate to Settings → API Access
   - Generate a new API key if you don't have one
   - Note down your Store ID and API key

### 3.2. Configuring the Integration

1. **Update Environment Variables**
   - Ensure your `.env.local` file contains the correct DecoNetwork credentials
   - Double-check the API URL (it may vary depending on your region)

2. **Mapping Products**
   - Each product in your LT's Business site needs a corresponding product in DecoNetwork
   - Find `src/lib/deco-network.ts` to update product mappings if needed

3. **Customization Settings**
   - Configure available decoration methods in DecoNetwork
   - Set pricing rules for different customization options
   - Define decoration areas (front, back, sleeve, etc.)

### 3.3. Testing the Integration

1. **Verify API Connection**
   - Start the development server
   - Open browser developer tools (F12 or Ctrl+Shift+I)
   - Check the Network tab for API requests to DecoNetwork
   - Verify authentication is successful

2. **Test the Customizer Flow**
   - Navigate to a product page
   - Click the "Start Customizing" button
   - Upload a test logo or add text
   - Verify the designer loads correctly
   - Complete the customization process
   - Check that the customized product is added to cart correctly

3. **Debugging Common Issues**
   - CORS errors: Verify your DecoNetwork account allows API access from your domain
   - Authentication failures: Check API credentials
   - Designer not loading: Check for JavaScript errors in console
   - Preview issues: Verify image paths and permissions

---

## 4. Deployment Options

### 4.1. Preparing for Deployment

1. **Build the Project**
   - Run the build command:
     ```bash
     # Using Bun
     bun run build

     # Using npm
     npm run build
     ```

2. **Test the Production Build Locally**
   - Start the production server:
     ```bash
     # Using Bun
     bun run start

     # Using npm
     npm run start
     ```
   - Visit `http://localhost:3000` to ensure everything works correctly

3. **Prepare Configuration Files**
   - Check `netlify.toml` for Netlify configuration
   - Review `next.config.js` for any environment-specific settings

### 4.2. Netlify Deployment (Recommended)

#### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   - Ensure your code is committed to a GitHub repository

2. **Connect Netlify to GitHub**
   - Create a Netlify account or log in at [netlify.com](https://www.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - Build command: `bun run build` or `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

4. **Environment Variables**
   - In Netlify dashboard, go to Site settings → Build & deploy → Environment
   - Add your DecoNetwork API credentials and other environment variables
   - Redeploy your site after adding variables

5. **Domain Setup**
   - In Netlify dashboard, go to Site settings → Domain management
   - Add your custom domain or use the provided Netlify subdomain

#### Method 2: Manual Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Configure Environment Variables**
   - Set environment variables via the Netlify CLI or dashboard

### 4.3. GoDaddy Hosting

#### Method 1: Hosting with Node.js Support (Preferred)

1. **Verify Node.js Support**
   - Ensure your GoDaddy hosting plan includes Node.js support
   - Check available Node.js version (should be 16.x or higher)

2. **Deploy Files**
   - Upload the entire project to your hosting via FTP
   - Include the `.next` directory generated after building

3. **Configure Server**
   - Set up the startup command in GoDaddy's Node.js configuration:
     ```
     npm start
     ```
   - Set environment variables in the hosting control panel

4. **Set Up Domain**
   - Point your domain to the Node.js application
   - Configure SSL if needed

#### Method 2: Static Export (Alternative)

If your GoDaddy hosting doesn't support Node.js:

1. **Modify Configuration for Static Export**
   - Edit `next.config.js`:
     ```js
     /** @type {import('next').NextConfig} */
     const nextConfig = {
       output: 'export',
       distDir: 'out',
       images: {
         unoptimized: true,
       },
       // ... other config
     };

     module.exports = nextConfig;
     ```

2. **Build Static Version**
   ```bash
   bun run build
   # or npm run build
   ```

3. **Upload Static Files**
   - Upload the contents of the `out` directory to your GoDaddy hosting
   - Typically uploaded to the `public_html` folder

4. **Configure Server**
   - Ensure proper rewrite rules are set up
   - Example .htaccess file for Apache:
     ```
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

> **Note**: The static export option will limit some dynamic features like the DecoNetwork integration. It's recommended to use a hosting provider that supports Node.js for the full functionality.

### 4.4. Other Hosting Options

#### Vercel (Similar to Netlify)

1. **Connect to GitHub**
   - Sign up/log in at [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Follow the setup wizard

2. **Configure Environment**
   - Add environment variables
   - Deploy the project

#### Digital Ocean / AWS / Azure

For more control with virtual servers:

1. **Provision Server**
   - Set up a virtual server with Node.js

2. **Deploy Code**
   - Clone repository to server
   - Install dependencies
   - Build the project

3. **Set Up Process Manager**
   - Install PM2: `npm install -g pm2`
   - Start the application: `pm2 start npm --name "lts-business" -- start`

4. **Configure Nginx**
   - Set up as reverse proxy to the Node.js server
   - Configure SSL with Let's Encrypt

---

## 5. Maintenance and Updates

### 5.1. Regular Maintenance Tasks

1. **Dependency Updates**
   - Regularly update dependencies:
     ```bash
     bun update
     # or npm update
     ```
   - Check for security vulnerabilities:
     ```bash
     bun audit
     # or npm audit
     ```

2. **Content Updates**
   - Update product information in `src/lib/products.ts`
   - Refresh images and marketing content
   - Update pricing and promotional offers

3. **DecoNetwork Synchronization**
   - Keep products synchronized between your website and DecoNetwork
   - Update pricing rules when needed
   - Refresh design templates seasonally

4. **Backup Procedures**
   - Regularly backup your codebase
   - Export customer and order data
   - Maintain configuration backups

### 5.2. Feature Updates

1. **Adding New Pages**
   - Create new files in the `src/app` directory
   - Follow the existing patterns for page structure
   - Update navigation menus

2. **Extending Functionality**
   - Add new components in `src/components`
   - Extend context providers in `src/lib`
   - Update relevant types and interfaces

3. **Testing Updates**
   - Test thoroughly in development environment
   - Consider browser compatibility
   - Verify mobile responsiveness

### 5.3. Deployment Updates

1. **Staging Process**
   - Test updates in a staging environment first
   - For Netlify: Use branch deploys or preview deploys
   - Verify functionality before promoting to production

2. **Production Deployment**
   - Schedule updates during low-traffic periods
   - Monitor closely after deployment
   - Have a rollback plan ready

---

## 6. Troubleshooting

### 6.1. Development Issues

1. **Build Errors**
   - Check console for specific error messages
   - Verify TypeScript types with `bun run type-check` or `npx tsc --noEmit`
   - Look for missing dependencies

2. **Runtime Errors**
   - Check browser console for JavaScript errors
   - Verify environment variables are correctly set
   - Check for API or network errors

3. **Environment Setup Problems**
   - Ensure Node.js and Bun are correctly installed
   - Verify all dependencies are installed: `bun install` or `npm install`
   - Check for Node.js version compatibility

### 6.2. DecoNetwork Integration Issues

1. **API Connection Problems**
   - Verify API credentials are correct
   - Check for CORS issues
   - Ensure the DecoNetwork account is active

2. **Designer Not Loading**
   - Check for popup blocker interference
   - Verify cross-origin settings
   - Review browser console for errors

3. **Customization Not Working**
   - Verify product mapping is correct
   - Check that the product exists in DecoNetwork
   - Test with different browsers

### 6.3. Deployment Issues

1. **Netlify/Vercel Deployment Failures**
   - Check build logs for errors
   - Verify environment variables are set
   - Check for unsupported features

2. **GoDaddy Hosting Issues**
   - Verify Node.js support if using dynamic site
   - Check file permissions
   - Review server error logs

3. **Domain Configuration Problems**
   - Verify DNS settings
   - Check SSL certificate setup
   - Allow propagation time for DNS changes

### 6.4. Getting Help

If you encounter persistent issues:

1. **Check Documentation**
   - Review Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
   - Check DecoNetwork API documentation
   - Consult deployment platform documentation

2. **Contact Support**
   - DecoNetwork support for API issues
   - Hosting provider support for deployment problems
   - Developer support for code-specific issues

3. **Community Resources**
   - Stack Overflow for coding questions
   - Next.js community forums
   - GitHub issues for specific libraries

---

## 7. Quick Reference

### Important Commands

```bash
# Install dependencies
bun install

# Start development server
bun --bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Type checking
bun run type-check
```

### Key File Locations

- **Product Data**: `src/lib/products.ts`
- **DecoNetwork Integration**: `src/lib/deco-network.ts`
- **Customizer Component**: `src/app/products/[id]/customizer.tsx`
- **Main Page**: `src/app/page.tsx`
- **Admin Dashboard**: `src/app/admin/page.tsx`
- **Navigation/Header**: `src/components/Header.tsx`
- **Footer**: `src/components/Footer.tsx`

### Environment Variables

```
# DecoNetwork API
NEXT_PUBLIC_DECO_API_URL=https://api.deconetwork.com
DECO_API_KEY=your_api_key_here
DECO_STORE_ID=your_store_id_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

---

*This guide was created on April 9, 2026*

For additional support, contact:
- Email: support@ltsportland.com
- Phone: 207-774-1104
