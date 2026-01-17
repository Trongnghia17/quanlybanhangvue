<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ routeName }}</a>
      <button
        class="navbar-toggler navbar-burger"
        type="button"
        @click="toggleSidebar"
        :aria-expanded="$sidebar.showSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
      </button>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
          <drop-down
            class="nav-item"
            :title="getUserName"
            title-classes="nav-link"
            icon="ti-settings"
          >
            <a class="dropdown-item" href="#" @click.prevent="openUserAccountDialog">Thông tin tài khoản</a>
            <a class="dropdown-item" href="#" @click.prevent="openPasswordTab">Đổi mật khẩu</a>
            <a class="dropdown-item" href="#" @click.prevent="handleLogout">Đăng xuất</a>
          </drop-down>
        </ul>
      </div>
    </div>
    
    <!-- User Account Dialog -->
    <user-account-dialog 
      :dialog.sync="showUserAccountDialog" 
      ref="userAccountDialog"
    />
  </nav>
</template>

<script>
import UserAccountDialog from '@/components/Dialogs/Auth/UserAccountDialog.vue';

export default {
  components: {
    UserAccountDialog
  },
  computed: {
    getUserName() {
      try {
        const vuexUser = this.$store && this.$store.getters.currentUser;
        if (vuexUser && vuexUser.name) {
          return vuexUser.name;
        }

        // Fallback to localStorage
        const localUser = JSON.parse(localStorage.getItem('user_info') || '{}');
        return localUser.name || 'Cài đặt';
      } catch (error) {
        console.error('Error getting user name:', error);
        return 'Cài đặt';
      }
    },
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name || '');
    },
  },
  data() {
    return {
      activeNotifications: false,
      showUserAccountDialog: false,
    };
  },
  methods: {
    handleLogout() {
      this.$router.push('/login');
      try {
        // Try to use Vuex action if available
        if (this.$store && typeof this.$store.dispatch === 'function') {
          this.$store.dispatch('logout');
        } else {
          // Fallback: handle logout directly
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.href = '/login';
      }
    },
    openUserAccountDialog() {
      this.showUserAccountDialog = true;
    },
    openPasswordTab() {
      this.showUserAccountDialog = true;
      // Wait for dialog to open before setting the active tab
      this.$nextTick(() => {
        if (this.$refs.userAccountDialog) {
          this.$refs.userAccountDialog.activeTab = 1; // Set active tab to password tab
        }
      });
    },
    capitalizeFirstLetter(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      if (this.$sidebar && typeof this.$sidebar.displaySidebar === 'function') {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      }
    },
    hideSidebar() {
      if (this.$sidebar && typeof this.$sidebar.displaySidebar === 'function') {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
};
</script>
<style scoped>
.navbar-nav .dropdown-menu {
  right: 0; /* Align to the right edge of the parent */
  left: auto; /* Prevent left alignment */
  transform: translateX(-10px); /* Shift slightly left to avoid overflow */
  max-width: 200px; /* Constrain width to prevent overflow */
  min-width: 150px; /* Ensure minimum width for readability */
  overflow-x: hidden; /* Hide any horizontal overflow */
}

/* Optional: Ensure dropdown items don't stretch too wide */
.dropdown-item {
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis for long text */
}
</style>
