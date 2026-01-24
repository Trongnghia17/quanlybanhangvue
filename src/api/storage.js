import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getStorage: {
      url: 'users/get-storage',
      method: 'GET'
    },
    getListInventories: {
      url: 'inventories',
      method: 'GET'
    },
    createInventory: {
      url: 'inventories',
      method: 'POST'
    },
    detailInventory: {
      url: 'inventories/{id}',
      method: 'GET'
    },
    deleteInventory: {
      url: 'inventories/{id}',
      method: 'DELETE'
    },
  }
}

const actions = {
  async getStorage(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getStorage.url,
      method: apiState.getStorage.method,
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
  async getListInventories(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getListInventories.url,
      method: apiState.getListInventories.method,
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
  async createInventory(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createInventory.url,
      method: apiState.createInventory.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      data: {
        ...payload,
      },
    });
  },
  async detailInventory(id) {
    const apiState = state();
    return await axios({
      url: apiState.detailInventory.url.replace('{id}', id),
      method: apiState.detailInventory.method,
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
  async deleteInventory(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteInventory.url.replace('{id}', id),
      method: apiState.deleteInventory.method,
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
}

export default {
  state,
  actions
}
