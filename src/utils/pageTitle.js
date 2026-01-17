// Utility for managing document title and favicon
export class PageTitleManager {
  static setTitle(title) {
    document.title = title || 'Sale Management System';
    
    // Also update meta tags for better SEO
    this.updateMetaTag('og:title', title);
    this.updateMetaTag('twitter:title', title);
  }
  
  static setFavicon(iconPath) {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    existingFavicons.forEach(link => link.remove());
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.sizes = '96x96';
    link.href = iconPath;
    document.head.appendChild(link);
    
    // Add apple touch icon for better mobile support
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.sizes = '96x96';
    appleTouchIcon.href = iconPath;
    document.head.appendChild(appleTouchIcon);
  }
  
  static updateMetaTag(property, content) {
    let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  }
  
  static setDescription(description) {
    this.updateMetaTag('description', description);
    this.updateMetaTag('og:description', description);
    this.updateMetaTag('twitter:description', description);
  }
  
  // Method to set complete page metadata
  static setPageMeta(options = {}) {
    const { title, icon, description } = options;
    
    if (title) this.setTitle(title);
    if (icon) this.setFavicon(icon);
    if (description) this.setDescription(description);
  }
}

export default PageTitleManager;
