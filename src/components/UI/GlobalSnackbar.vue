<template>
  <v-snackbar
    v-model="snackbarVisible"
    :color="snackbarColor"
    :timeout="snackbarTimeout"
    :top="isPositionTop"
    :bottom="isPositionBottom"
    :left="isPositionLeft"
    :right="isPositionRight"
    :centered="isPositionCentered"
    :multi-line="multiLine"
  >
    <div class="d-flex align-center">
      <v-icon v-if="snackbarIcon" left class="mr-2">{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}
    </div>
    <template v-slot:action="{ attrs }">
      <v-btn
        v-if="showClose"
        icon
        small
        text
        v-bind="attrs"
        @click="closeSnackbar"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Snackbar',
  data() {
    return {
      defaultValues: {
        show: false,
        text: '',
        color: 'success',
        timeout: 5000,
        position: 'top-right', // Updated default
        icon: '',
        showClose: true,
        multiLine: false
      }
    };
  },
  computed: {
    // Direct store access instead of mapState
    snackbarState() {
      try {
        return this.$store && this.$store.state && this.$store.state.snackbar
          ? this.$store.state.snackbar
          : this.defaultValues;
      } catch (e) {
        console.error("Error accessing store state:", e);
        return this.defaultValues;
      }
    },
    show() {
      return this.snackbarState.show;
    },
    text() {
      return this.snackbarState.text;
    },
    color() {
      return this.snackbarState.color;
    },
    timeout() {
      return this.snackbarState.timeout;
    },
    position() {
      return this.snackbarState.position;
    },
    icon() {
      return this.snackbarState.icon;
    },
    showClose() {
      return this.snackbarState.showClose;
    },
    multiLine() {
      return this.snackbarState.multiLine;
    },
    // Position computed properties
    isPositionTop() {
      return this.position === 'top' || this.position === 'top-right' || this.position === 'top-left';
    },
    isPositionBottom() {
      return this.position === 'bottom' || this.position === 'bottom-right' || this.position === 'bottom-left';
    },
    isPositionLeft() {
      return this.position === 'left' || this.position === 'top-left' || this.position === 'bottom-left';
    },
    isPositionRight() {
      return this.position === 'right' || this.position === 'top-right' || this.position === 'bottom-right';
    },
    isPositionCentered() {
      return this.position === 'centered';
    },
    snackbarVisible: {
      get() {
        return this.show;
      },
      set(value) {
        if (!value) this.closeSnackbar();
      }
    },
    snackbarText() {
      return this.text;
    },
    snackbarColor() {
      return this.color;
    },
    snackbarTimeout() {
      return this.timeout;
    },
    snackbarPosition() {
      return this.position;
    },
    snackbarIcon() {
      return this.icon;
    }
  },
  methods: {
    closeSnackbar() {
      try {
        if (this.$store && this.$store.commit) {
          this.$store.commit('snackbar/hideSnackbar');
        }
      } catch (e) {
        console.error("Error committing to store:", e);
      }
    }
  }
};
</script>

<style>
.v-snack {
  z-index: 10000; /* Ensure it appears above other elements */
}
</style>
