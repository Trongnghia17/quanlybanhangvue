import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'

const state = () => {
  return [
    {
      getListReceiptType: {
        url: '/receipt-type',
        method: 'GET'
      },
      createReceiptType: {
        url: '/receipt-type',
        method: 'POST'
      },
      updateReceiptType: {
        url: '/receipt-type/{id}',
        method: 'PUT'
      },
      deleteReceiptType: {
        url: '/receipt-type/{id}',
        method: 'DELETE'
      },
    },
  ]
}
const actions = {
  async getListReceiptType(payload) {
    const apiState = state();
    return await axios({
      url: apiState[0].getListReceiptType.url,
      method: apiState[0].getListReceiptType.method,
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
  async createReceiptType(payload) {
    const apiState = state();
    return await axios({
      url: apiState[0].createReceiptType.url,
      method: apiState[0].createReceiptType.method,
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
  async updateReceiptType(payload) {
    const apiState = state();
    return await axios({
      url: apiState[0].updateReceiptType.url.replace('{id}', payload.id),
      method: apiState[0].updateReceiptType.method,
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
  async deleteReceiptType(id) {
    const apiState = state();
    return await axios({
      url: apiState[0].deleteReceiptType.url.replace('{id}', id),
      method: apiState[0].deleteReceiptType.method,
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
  actions,
}


