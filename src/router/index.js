import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import PageTitleManager from "@/utils/pageTitle";
Vue.use(VueRouter);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "active",
});

router.beforeEach((to, from, next) => {
  // Check if the user is authenticated
  const isAuthenticated = Vue.$cookies.isKey("token");
  console.log("isAuthenticated", isAuthenticated);
  
  // Update page title and favicon using the utility
  if (to.meta) {
    PageTitleManager.setPageMeta({
      title: to.meta.title || "Sale Management System",
      icon: to.meta.icon || "/favicon.png",
      description: to.meta.description || "Hệ thống quản lý bán hàng"
    });
  }
  
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    console.log('User is not authenticated, redirecting to login');
    next({ name: "login" }); // Redirect to login page
  } else {
    next(); // Proceed to the route
  }
});
// Export the router instance


export default router;
