import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
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
    return await axiosInstance({
      url: apiState.getListCategories.url,
      method: apiState.getListCategories.method,
      params: {
        ...payload,
      },
    });
  },
  async createCategory(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.createCategory.url,
      method: apiState.createCategory.method,
      data: payload,
    });
  },
  async updateCategory(payload) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.updateCategory.url.replace('{id}', payload.id),
      method: apiState.updateCategory.method,
      data: payload.data,
    });
  },
  async deleteCategory(id) {
    const apiState = state();
    return await axiosInstance({
      url: apiState.deleteCategory.url.replace('{id}', id),
      method: apiState.deleteCategory.method,
    });
  },
}
export default {
  state,
  actions
}
