import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getListReceiptPayments: {
      url: '/report/receipt-payment',
      method: 'GET'
    },
    createReceipt: {
      url: '/receipt-payment/receipt',
      method: 'POST'
    },
    createPayment: {
      url: '/receipt-payment/payment',
      method: 'POST'
    },
    deleteReceipt: {
      url: '/receipt-payment/receipt/{id}',
      method: 'DELETE'
    },
    deletePayment: {
      url: '/receipt-payment/payment/{id}',
      method: 'DELETE'
    },
  }
}

const actions = {
  async getListReceiptPayments(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getListReceiptPayments.url,
      method: apiState.getListReceiptPayments.method,
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
  async createReceipt(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createReceipt.url,
      method: apiState.createReceipt.method,
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
  async createPayment(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createPayment.url,
      method: apiState.createPayment.method,
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
  async deleteReceipt(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteReceipt.url.replace('{id}', id),
      method: apiState.deleteReceipt.method,
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
  async deletePayment(id) {
    const apiState = state();
    return await axios({
      url: apiState.deletePayment.url.replace('{id}', id),
      method: apiState.deletePayment.method,
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
