import Vue from "vue";
import App from "./App";
import router from "./router/index";
import vuetify from './plugins/vuetify'; // Import Vuetify
import VueCookies from 'vue-cookies'
import store from './store'; // Import the store
// import snackbarPlugin from './plugins/snackbar';

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


import PaperDashboard from "./plugins/paperDashboard";
import PageTitlePlugin from "./plugins/pageTitle";
import "vue-notifyjs/themes/default.css";

Vue.use(PaperDashboard);
Vue.use(PageTitlePlugin);
Vue.use(VueCookies)

Vue.$cookies.config('30d')

/* eslint-disable no-new */
new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
