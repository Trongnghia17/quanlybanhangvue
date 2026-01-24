import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
import axiosInstance from '@/utils/axios'
import Cookies from 'vue-cookies'

const state = () => {
    return {
        getDashboard: {
            url: '/dash-board',
            method: 'GET'
        }
    }
}

const actions = {   
    async getDashboard(payload) {
        const apiState = state();
        return await axiosInstance({
            url: apiState.getDashboard.url,
            method: apiState.getDashboard.method,
            params: {
                ...payload,
            },
        });
    }
}
export default 
{
    state,
    actions
}

