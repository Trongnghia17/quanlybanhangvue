export default {
  install(Vue, { store }) {
    if (!store) {
      console.error('Vuex store must be provided to the snackbar plugin');
      return;
    }

    // Make $snackbar available globally
    Vue.prototype.$snackbar = {
      show(options) {
        store.dispatch('snackbar/showSnackbar', options);
      },
      success(text) {
        store.dispatch('snackbar/successSnackbar', text);
      },
      error(text) {
        store.dispatch('snackbar/errorSnackbar', text);
      },
      info(text) {
        store.dispatch('snackbar/infoSnackbar', text);
      },
      warning(text) {
        store.dispatch('snackbar/warningSnackbar', text);
      },
      hide() {
        store.commit('snackbar/hideSnackbar');
      }
    };
  }
};
