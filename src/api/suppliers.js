import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getSuppliers: {
      url: '/suppliers',
      method: 'GET'
    },
    createSupplier: {
      url: '/suppliers',
      method: 'POST'
    },
    updateSupplier: {
      url: '/suppliers/{id}',
      method: 'PUT'
    },
    deleteSupplier: {
      url: '/suppliers/{id}',
      method: 'DELETE'
    },
    exportSuppliers: {
      url: '/suppliers/export-suppliers',
      method: 'POST'
    }
  }
}
const actions = {
  async getSuppliers(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getSuppliers.url,
      method: apiState.getSuppliers.method,
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

  async createSupplier(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createSupplier.url,
      method: apiState.createSupplier.method,
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

  async updateSupplier(payload) {
    const apiState = state();
    return await axios({
      url: apiState.updateSupplier.url.replace('{id}', payload.id),
      method: apiState.updateSupplier.method,
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

  async deleteSupplier(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteSupplier.url.replace('{id}', id),
      method: apiState.deleteSupplier.method,
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
  async exportSuppliers(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportSuppliers.url,
      method: apiState.exportSuppliers.method,
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
};
export default {
  state,
  actions
}
