import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'
const state = () => {
  return {
    getInventories: {
      url: '/inventories',
      method: 'GET'
    },
    createInventory: {
      url: '/inventories',
      method: 'POST'
    },
    updateInventory: {
      url: '/inventories/{id}',
      method: 'PUT'
    },
    deleteInventory: {
      url: '/inventories/{id}',
      method: 'DELETE'
    }
  }
}
const actions = {
  async getInventories(payload) {
    const apiState = state()
    return await axios({
      url: apiState.getInventories.url,
      method: apiState.getInventories.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : ''
      },
      params: {
        ...payload
      }
    })
  },
  async createInventory(payload) {
    const apiState = state()
    return await axios({
      url: apiState.createInventory.url,
      method: apiState.createInventory.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : ''
      },
      data: payload
    })
  },
  async updateInventory(payload) {
    const apiState = state()
    return await axios({
      url: apiState.updateInventory.url.replace('{id}', payload.id),
      method: apiState.updateInventory.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : ''
      },
      data: payload
    })
  },
  async deleteInventory(payload) {
    const apiState = state()
    return await axios({
      url: apiState.deleteInventory.url.replace('{id}', payload.id),
      method: apiState.deleteInventory.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : ''
      },
      data: payload
    })
  }
}
export default {
  state,
  actions
}
