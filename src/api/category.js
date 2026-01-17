import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getListCategories: {
      url: '/categories',
      method: 'GET'
    },
    createCategory: {
      url: '/categories',
      method: 'POST'
    },
    updateCategory: {
      url: '/categories/{id}',
      method: 'PUT'
    },
    deleteCategory: {
      url: '/categories/{id}',
      method: 'DELETE'
    },
  }
}

const actions = {
  async getListCategories(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getListCategories.url,
      method: apiState.getListCategories.method,
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
  async createCategory(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createCategory.url,
      method: apiState.createCategory.method,
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
  async updateCategory(payload) {
    const apiState = state();
    return await axios({
      url: apiState.updateCategory.url.replace('{id}', payload.id),
      method: apiState.updateCategory.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
      },
      data: payload.data,
    });
  },
  async deleteCategory(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteCategory.url.replace('{id}', id),
      method: apiState.deleteCategory.method,
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
