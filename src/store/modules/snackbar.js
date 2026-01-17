export default {
  namespaced: true,
  state: {
    show: false,
    text: '',
    color: 'success',
    timeout: 5000,
    position: 'top-right', // Changed from 'bottom' to 'top-right'
    icon: '',
    showClose: true,
    multiLine: false
  },
  mutations: {
    showSnackbar(state, payload) {
      state.show = true;
      state.text = payload.text || '';
      state.color = payload.color || 'success';
      state.timeout = payload.timeout !== undefined ? payload.timeout : 5000;
      state.position = payload.position || 'top-right'; // Changed default here too
      state.icon = payload.icon || '';
      state.showClose = payload.showClose !== undefined ? payload.showClose : true;
      state.multiLine = payload.multiLine || false;
    },
    hideSnackbar(state) {
      state.show = false;
    }
  },
  actions: {
    showSnackbar({ commit }, payload) {
      commit('showSnackbar', payload);
    },
    successSnackbar({ commit }, text) {
      commit('showSnackbar', { text, color: 'success', icon: 'mdi-check-circle' });
    },
    errorSnackbar({ commit }, text) {
      commit('showSnackbar', { text, color: 'error', icon: 'mdi-alert-circle' });
    },
    infoSnackbar({ commit }, text) {
      commit('showSnackbar', { text, color: 'info', icon: 'mdi-information' });
    },
    warningSnackbar({ commit }, text) {
      commit('showSnackbar', { text, color: 'warning', icon: 'mdi-alert' });
    }
  }
};
