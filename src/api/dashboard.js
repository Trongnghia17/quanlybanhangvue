import URL from '@/assets/configurations/BASE_URL.js'
import axios from 'axios'
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
        return await axios({
            url: apiState.getDashboard.url,
            method: apiState.getDashboard.method,
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
    }
}
export default 
{
    state,
    actions
}

