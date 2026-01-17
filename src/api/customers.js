import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
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
    return await axios({
      url: apiState.getCustomers.url,
      method: apiState.getCustomers.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      params: {
        ...payload,
      },
    });
  },

  async createCustomer(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createCustomer.url,
      method: apiState.createCustomer.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      data: payload,
    });
  },

  async updateCustomer(payload) {
    const apiState = state();
    return await axios({
      url: apiState.updateCustomer.url.replace('{id}', payload.id),
      method: apiState.updateCustomer.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      data: payload
    });
  },

  async deleteCustomer(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteCustomer.url.replace('{id}', id),
      method: apiState.deleteCustomer.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
    });
  },
  async exportCustomers(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportCustomers.url,
      method: apiState.exportCustomers.method,
      baseURL: URL.BASE_URL,
      responseType: 'blob', // Important for file downloads
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      data: payload,
    });
  }
}
export default {
  state,
  actions
}
