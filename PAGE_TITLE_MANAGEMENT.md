# Page Title and Favicon Management

This project now includes a comprehensive system for managing page titles and favicons dynamically based on the current route.

## Features

- **Dynamic Page Titles**: Each page automatically gets a specific title based on the route
- **Dynamic Favicons**: Different icons for different page types (dashboard, orders, customers, etc.)
- **SEO Meta Tags**: Automatic management of meta descriptions and Open Graph tags
- **Mobile Support**: Apple touch icons for better mobile experience

## How It Works

### 1. Route-Based Management
The system automatically updates the page title and favicon when navigating between routes. Each route in `src/router/routes.js` has metadata that defines:

```javascript
{
  path: "/dashboard",
  name: "dashboard",
  component: Dashboard,
  meta: {
    title: "Bảng điều khiển - Sale Management System",
    icon: "/icons/dashboard.png",
    description: "Tổng quan về hoạt động kinh doanh và các chỉ số quan trọng"
  }
}
```

### 2. Icon Categories
Different page types use different favicons:

- **Dashboard**: `/icons/dashboard.png` - Dashboard and overview pages
- **Orders**: `/icons/orders.png` - Sales and purchase order pages
- **Customers**: `/icons/customers.png` - Customer and supplier management
- **Products**: `/icons/products.png` - Product and category management
- **Reports**: `/icons/reports.png` - All report pages
- **Storage**: `/icons/storage.png` - Inventory and storage management
- **Payments**: `/icons/payments.png` - Receipt and payment management

### 3. Manual Title Updates
You can also manually update the page title from within Vue components:

```javascript
// In a Vue component
export default {
  mounted() {
    // Update just the title
    this.$updateTitle('Custom Page Title');
    
    // Update title and favicon
    this.$setPageTitle('Custom Title', '/custom-icon.png');
    
    // Update with full metadata
    this.$setPageTitle(
      'Custom Title', 
      '/custom-icon.png', 
      'Custom description for SEO'
    );
  }
}
```

### 4. Utility Class
For advanced usage, you can directly use the `PageTitleManager` utility:

```javascript
import PageTitleManager from '@/utils/pageTitle';

// Set complete page metadata
PageTitleManager.setPageMeta({
  title: 'New Page Title',
  icon: '/new-icon.png',
  description: 'New page description'
});

// Individual methods
PageTitleManager.setTitle('Just the title');
PageTitleManager.setFavicon('/just-icon.png');
PageTitleManager.setDescription('Just description');
```

## Adding New Pages

When adding new routes, make sure to include the appropriate metadata:

```javascript
{
  path: "/new-page",
  name: "new-page",
  component: NewPageComponent,
  meta: {
    title: "New Page - Sale Management System",
    icon: "/icons/appropriate-category.png",
    description: "Description of what this page does"
  }
}
```

## File Structure

```
src/
├── utils/
│   └── pageTitle.js          # Core utility class
├── plugins/
│   └── pageTitle.js          # Vue plugin for global methods
├── mixins/
│   └── pageTitle.js          # Vue mixin (legacy, use plugin instead)
└── router/
    ├── index.js              # Router with title management
    └── routes.js             # Route definitions with metadata

public/
├── favicon.png               # Default favicon
└── icons/
    ├── dashboard.png         # Dashboard pages
    ├── orders.png           # Order pages
    ├── customers.png        # Customer/supplier pages
    ├── products.png         # Product/category pages
    ├── reports.png          # Report pages
    ├── storage.png          # Storage/inventory pages
    └── payments.png         # Payment pages
```

## Browser Support

The system includes:
- Standard favicon support for all browsers
- Apple touch icons for iOS devices
- Meta descriptions for SEO
- Open Graph tags for social media sharing

## Customization

To add new icon categories:
1. Add new icon files to `public/icons/`
2. Update route metadata to use the new icons
3. Optionally create themed icons for better visual distinction
