import PageTitleManager from '@/utils/pageTitle';

// Vue plugin for page title management
export default {
  install(Vue) {
    // Add global method to Vue instances
    Vue.prototype.$setPageTitle = function(title, icon = null, description = null) {
      PageTitleManager.setPageMeta({
        title,
        icon,
        description
      });
    };

    // Add global method to just update title
    Vue.prototype.$updateTitle = function(title) {
      PageTitleManager.setTitle(title);
    };

    // Add global method to just update favicon
    Vue.prototype.$updateFavicon = function(iconPath) {
      PageTitleManager.setFavicon(iconPath);
    };

    // Add global property to access the PageTitleManager
    Vue.prototype.$pageTitle = PageTitleManager;
  }
};
