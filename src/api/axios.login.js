import axios from 'axios'
import {URL_V2} from './url'

class LoginClass {
    // 登录
    login (data) {
        return axios({
            url: URL_V2 + '/user/login',
            method: 'post',
            data
        })
    }

    // 登出
    logout () {
        return axios({
            url: URL_V2 + '/user/logout',
            method: 'get'
        })
    }

    // 获取域列表
    getDomainList () {
        return axios({
            url: URL_V2 + '/user/domain/list',
            method: 'get'
        })
    }
}

export default new LoginClass()
