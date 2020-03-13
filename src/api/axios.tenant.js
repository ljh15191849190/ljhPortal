import axios from 'axios'
import {URL_V2} from './url'

class TenantApiClass {
    // 获取租户列表
    getTenantList () {
        return axios({
            url: URL_V2 + '/user/project/lists',
            method: 'get'
        })
    }

    // 创建租户
    createTenant (data) {
        return axios({
            url: URL_V2 + '/user/project/create',
            data: data,
            method: 'post'
        })
    }

    // 更新租户
    updateTenant (data) {
        return axios({
            url: URL_V2 + '/user/project/update',
            data: data,
            method: 'post'
        })
    }

    // 更新租户
    switchTenant (projectId) {
        return axios({
            url: URL_V2 + '/user/project/change?project_id=' + projectId,
            method: 'get'
        })
    }

    // 根据用户来源获取租户
    getTenantListByDomainId (domainId = '') {
        return axios({
            url: `${URL_V2}/user/project/lists?domain_id=${domainId}`,
            method: 'get'
        })
    }
}

export default new TenantApiClass()
