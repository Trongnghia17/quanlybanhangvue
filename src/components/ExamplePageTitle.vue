<!-- Example Vue component showing how to use dynamic page titles -->
<template>
  <div>
    <h1>Example Page</h1>
    <p>This page demonstrates dynamic title management.</p>
    
    <v-btn @click="updateTitle" color="primary">
      Update Title Dynamically
    </v-btn>
    
    <v-btn @click="updateTitleAndIcon" color="secondary" class="ml-2">
      Update Title + Icon
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'ExamplePageTitleComponent',
  
  mounted() {
    // Example: Update title when component is mounted
    // This will override the route-based title
    this.$setPageTitle(
      'Dynamic Title - Sale Management System',
      '/icons/dashboard.png',
      'This page shows dynamic title management'
    );
  },
  
  methods: {
    updateTitle() {
      const newTitle = `Updated at ${new Date().toLocaleTimeString()} - Sale Management System`;
      this.$updateTitle(newTitle);
    },
    
    updateTitleAndIcon() {
      const timestamp = new Date().toLocaleTimeString();
      this.$setPageTitle(
        `New Title ${timestamp} - Sale Management System`,
        '/icons/reports.png',
        'Dynamically updated page with new icon'
      );
    }
  },
  
  beforeDestroy() {
    // Optional: Reset to default when leaving the component
    // Usually not needed as route navigation will handle this
    this.$updateTitle('Sale Management System');
  }
}
</script>
