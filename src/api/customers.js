import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getCustomers: {
      url: '/customers',
      method: 'GET'
    },
    createCustomer: {
      url: '/customers',
      method: 'POST'
    },
    updateCustomer: {
      url: '/customers/{id}',
      method: 'PUT'
    },
    deleteCustomer: {
      url: '/customers/{id}',
      method: 'DELETE'
    },
    exportCustomers: {
      url: '/customers/export-customers',
      method: 'POST'
    }
  }
}
const actions = {
  async getCustomers(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.getCustomers.url,
      method: apiState.getCustomers.method,
      params: {
        ...payload,
      },
    });
  },

  async createCustomer(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.createCustomer.url,
      method: apiState.createCustomer.method,
      data: payload,
    });
  },

  async updateCustomer(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.updateCustomer.url.replace('{id}', payload.id),
      method: apiState.updateCustomer.method,
      data: payload
    });
  },

  async deleteCustomer(id) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.deleteCustomer.url.replace('{id}', id),
      method: apiState.deleteCustomer.method,
    });
  },
  async exportCustomers(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.exportCustomers.url,
      method: apiState.exportCustomers.method,
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      data: payload,
    });
  }
}
export default {
  state,
  actions
}
