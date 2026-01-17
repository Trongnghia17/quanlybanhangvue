import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import Cookies from 'vue-cookies'

const state = () => {
  return {
    getProducts: {
      url: '/products',
      method: 'GET'
    },
    getProductsV2:
    {
      url: 'v2/products',
      method: 'GET'
    },
    createProduct: {
      url: '/products',
      method: 'POST'
    },
    updateProduct: {
      url: '/products/{id}',
      method: 'POST'
    },
    deleteProduct: {
      url: '/products/{id}',
      method: 'DELETE'
    },
    getStorage: {
      url: '/users/get-storage',
      method: 'GET'
    },
    exportProducts: {
      url: '/products/export-products',
      method: 'POST'
    },
    importProducts: {
      url: '/products/import',
      method: 'POST'
    },
  }
}

const actions = {
  async getProducts(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getProducts.url,
      method: apiState.getProducts.method,
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
  async getProductsV2(payload) {
    const apiState = state();
    return await axios({
      url: apiState.getProductsV2.url,
      method: apiState.getProductsV2.method,
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

  async createProduct(payload) {
    const apiState = state();
    return await axios({
      url: apiState.createProduct.url,
      method: apiState.createProduct.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? `Bearer ${Cookies.get('token')}`
            : '',
        'Content-Type': 'multipart/form-data'
      },
      data: payload,
    });
  },

  async updateProduct(formData) {
    const apiState = state();
    console.log('Update URL:', apiState.updateProduct.url.replace('{id}', formData.get('id')));
    formData.append('_method', 'PUT');
    return await axios({
      url: apiState.updateProduct.url.replace('{id}', formData.get('id')),
      method: apiState.updateProduct.method,
      baseURL: URL.BASE_URL,
      headers: {
        'Authorization': Cookies.get('token') ? `Bearer ${Cookies.get('token')}` : '',
      },
      data: formData
    });
  },



  // async updateProduct(payload) {
  //   const apiState = state();
  //   return await axios({
  //     url: apiState.updateProduct.url.replace('{id}', payload.id),
  //     method: apiState.updateProduct.method,
  //     baseURL: URL.BASE_URL,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       Authorization:
  //         Cookies.get('token') != (null || undefined)
  //           ? `Bearer ${Cookies.get('token')}`
  //           : '',
  //     },
  //     data: payload,
  //   });
  // },

  async deleteProduct(payload) {
    const apiState = state();
    return await axios({
      url: apiState.deleteProduct.url.replace('{id}', payload.id),
      method: apiState.deleteProduct.method,
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
  async exportProducts(payload) {
    const apiState = state();
    return await axios({
      url: apiState.exportProducts.url,
      method: apiState.exportProducts.method,
      baseURL: URL.BASE_URL,
      responseType: 'blob',
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

  async importProducts(payload) {
    const apiState = state();
    return await axios({
      url: apiState.importProducts.url,
      method: apiState.importProducts.method,
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
}
export default {
  state,
  actions
}
