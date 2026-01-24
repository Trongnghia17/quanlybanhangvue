import URL from '@/assets/configurations/BASE_URL.js';
import axios from 'axios'
import axiosInstance from '@/utils/axios';
import Cookies from 'vue-cookies';

const state = () => {
  return {
    getAggregateReport: {
      url: '/report/aggregate',
      method: 'GET',
    },
    getStorageReport: {
      url: '/report/storage',
      method: 'GET',
    },
    getCustomerReport: {
      url: '/report/customer',
      method: 'GET',
    },
    getSupplierReport: {
      url: '/report/supplier',
      method: 'GET',
    },
    getProfitLossReport: {
      url: '/report/profit-loss',
      method: 'GET',
    },
  }
}
const actions = {
  async getAggregateReport(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getAggregateReport.url,
      method: apiState.getAggregateReport.method,
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

  async getStorageReport(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getStorageReport.url,
      method: apiState.getStorageReport.method,
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

  async getCustomerReport(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getCustomerReport.url,
      method: apiState.getCustomerReport.method,
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

  async getSupplierReport(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getSupplierReport.url,
      method: apiState.getSupplierReport.method,
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
  async getProfitLossReport(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getProfitLossReport.url,
      method: apiState.getProfitLossReport.method,
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
}

export default {
  state,
  actions,
};
