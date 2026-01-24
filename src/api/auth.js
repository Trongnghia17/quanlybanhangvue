import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios' // Import axios instance với interceptor
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getAccountInfo: {
      url: '/user',
      method: 'GET'
    },
    updateStoreName: {
      url: '/change-info',
      method: 'PUT'
    },
    login: {
      url: '/auth/login',
      method: 'POST'
    },
    logout: {
      url: '/auth/logout',
      method: 'POST'
    },
    register: {
      url: '/auth/register',
      method: 'POST'
    },
    confirmOTP: {
      url: '/auth/confirm-otp',
      method: 'POST'
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      method: 'POST'
    },
    resetPassword: {
      url: '/auth/reset-password',
      method: 'POST'
    },
    changePassword: {
      url: '/auth/change-password',
      method: 'POST'
    },
  }
}
const actions = {
  async getAccountInfo(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.getAccountInfo.url,
      method: apiState.getAccountInfo.method,
      params: {
        ...payload,
      },
    });
  },
  async login(payload) {
    const apiState = state();
    // Login không dùng interceptor để tránh vòng lặp
    return await axios({
      url: apiState.login.url,
      method: apiState.login.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      data: payload
    });
  },

  async register(payload) {
    const apiState = state();
    // Register không dùng interceptor
    return await axios({
      url: apiState.register.url,
      method: apiState.register.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      data: payload
    });
  },

  async confirmOTP(payload) {
    const apiState = state();
    return await axios({
      url: apiState.confirmOTP.url,
      method: apiState.confirmOTP.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      data: payload
    });
  },

  async updateStoreName(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.updateStoreName.url,
      method: apiState.updateStoreName.method,
      data: payload
    });
  },

  async resetPassword(payload) {
    const apiState = state();
    return await axios({
      url: apiState.resetPassword.url,
      method: apiState.resetPassword.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      data: payload
    });
  },

  async changePassword(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.changePassword.url,
      method: apiState.changePassword.method,
      data: payload
    });
  }
}

export default {
  state,
  actions
}
