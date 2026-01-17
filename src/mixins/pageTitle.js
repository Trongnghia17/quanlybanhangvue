// Mixin for managing page titles and favicon
export default {
  methods: {
    setPageTitle(title) {
      document.title = title || 'Sale Management System';
    },
    
    setFavicon(iconPath) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingFavicons.forEach(link => link.remove());
      
      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.sizes = '96x96';
      link.href = iconPath;
      document.head.appendChild(link);
    }
  }
}
