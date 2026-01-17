import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import Cookies from 'vue-cookies'


const state = () => {
  return {
    getListOrders: {
      url: '/orders',
      method: 'GET'
    },
    getOrderDetail: {
      url: '/orders/{id}',
      method: 'GET'
    },
    createOrder: {
      url: '/orders',
      method: 'POST'
    },
    updateOrder: {
      url: '/orders/{id}',
      method: 'PUT'
    },
    deleteOrder: {
      url: '/orders/{id}',
      method: 'DELETE'
    },
    cancelOrder: {
      url: '/orders/cancel/{id}',
      method: 'POST'
    },
    printOrder:
    {
      url: '/print/{id}',
      method: 'POST'
    },
    paymentOrder:
    {
      url: '/orders/payment/{id}',
      method: 'POST'
    },
    exportOrders: {
      url: '/orders/export-orders',
      method: 'POST'
    },
    exportCustomerOrders: {
      url: '/orders/export-customer-order/{id}',
      method: 'POST'
    },
    exportSupplierOrders: {
      url: '/orders/export-supplier-order/{id}',
      method: 'POST'
    },
  }
}
const actions = {
  async getListOrders(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getListOrders.url,
      method: apiState.getListOrders.method,
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
  async getOrderDetail(id) {
    const apiState = state();
    return await axios({
      url: apiState.getOrderDetail.url.replace('{id}', id),
      method: apiState.getOrderDetail.method,
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
  async createOrder(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createOrder.url,
      method: apiState.createOrder.method,
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
  async updateOrder(payload) {
    const apiState = state();
    const id = payload.id;
    delete payload.id; // Remove id from payload to avoid duplication

    return await axios({
      url: apiState.updateOrder.url.replace('{id}', id),
      method: apiState.updateOrder.method,
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
  async deleteOrder(id) {
    const apiState = state();
    return await axios({
      url: apiState.deleteOrder.url.replace('{id}', id),
      method: apiState.deleteOrder.method,
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
  async cancelOrder(id) {
    const apiState = state();
    return await axios({
      url: apiState.cancelOrder.url.replace('{id}', id),
      method: apiState.cancelOrder.method,
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
  async printOrder(id) {
    const apiState = state();
    return await axios({
      url: apiState.printOrder.url.replace('{id}', id),
      method: apiState.printOrder.method,
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
  async paymentOrder(payload) {
    const apiState = state();
    return await axios({
      url: apiState.paymentOrder.url.replace('{id}', payload.order_id),
      method: apiState.paymentOrder.method,
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
  async processPayment(payload) {
    const apiState = state();
    return await axios({
      url: apiState.paymentOrder.url.replace('{id}', payload.order_id),
      method: apiState.paymentOrder.method,
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
  async exportOrders(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportOrders.url,
      method: apiState.exportOrders.method,
      baseURL: URL.BASE_URL,
      responseType: 'blob', // Essential for binary file downloads
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
  },
  async exportCustomerOrders(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportCustomerOrders.url.replace('{id}', payload.id),
      method: apiState.exportCustomerOrders.method,
      baseURL: URL.BASE_URL,
      responseType: 'blob', // Essential for binary file downloads
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
  },
  async exportSupplierOrders(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportSupplierOrders.url.replace('{id}', payload.id),
      method: apiState.exportSupplierOrders.method,
      baseURL: URL.BASE_URL,
      responseType: 'blob', // Essential for binary file downloads
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
  },
}
export default {
  state,
  actions
}
