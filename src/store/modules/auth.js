// src/store/modules/auth.js
export default {
  state: {
    token: localStorage.getItem('auth_token') || '',
    user: JSON.parse(localStorage.getItem('user_info') || '{}'),
  },
  getters: {
    isLoggedIn: state => !!state.token,
    currentUser: state => state.user,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.token = '';
      state.user = {};
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_info', JSON.stringify(user));
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
    },
    logout({ commit }) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      commit('LOGOUT');
    }
  }
};
