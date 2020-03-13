import axios from 'axios'
import {URL_V2} from './url'

class BusinessApi {
    /**
     * 业务
     */
    // 获取业务list
    getBusinessList (params) {
        return axios({
            url: URL_V2 + '/business/list',
            method: 'get',
            params
        })
    }

    // 创建/修改 业务
    createOrUpdateBusiness (data) {
        return axios({
            url: URL_V2 + '/business/save',
            method: 'post',
            data
        })
    }

    // 检查业务是否同名接口
    checkBusinessName (name) {
        return axios({
            url: URL_V2 + '/business/chk/name',
            method: 'get',
            params: {
                name
            }
        })
    }

    // 删除业务
    deleteBusiness (data) {
        return axios({
            url: URL_V2 + '/business/del',
            method: 'delete',
            data
        })
    }

    /**
     * 应用
     */
    // 创建/更新 应用
    createOrUpdateApp (data) {
        return axios({
            url: URL_V2 + '/business/apps/save',
            method: 'post',
            data
        })
    }

    // 删除应用
    deleteApp (data) {
        return axios({
            url: URL_V2 + '/business/apps/del',
            method: 'delete',
            data
        })
    }

    // 获取应用
    getAppListByBusinessId (params) {
        return axios({
            url: URL_V2 + '/business/apps/list',
            method: 'get',
            params
        })
    }

    // 检查应用重名
    checkAppName (name) {
        return axios({
            url: URL_V2 + '/business/apps/chk/name',
            method: 'get',
            params: {
                name
            }
        })
    }

    /**
     * 授权
     */
    // 获取应用已授权信息
    getAppAuthorityById (id) {
        return axios({
            url: URL_V2 + '/business/app/org?app_id=' + id,
            method: 'get'
        })
    }

    // 修改应用授权组织机构
    editAppAuthority (data) {
        return axios({
            url: URL_V2 + '/business/app/org',
            method: 'put',
            data
        })
    }

    // 增量应用授权组织机构
    multipleAddAppAuthority (data) {
        return axios({
            url: URL_V2 + '/business/apps/orgs',
            method: 'post',
            data
        })
    }

    // 查询项目（业务）负责人
    getbussinessUser (params) {
        return axios({
            url: URL_V2 + '/business/search/project/user',
            method: 'get',
            params
        })
    }
    // 绑定项目（业务）负责人
    bindBussinessUser (data) {
        return axios({
            url: URL_V2 + '/business/binding/user/project',
            method: 'post',
            data
        })
    }
    // 查询应用负责人
    getAppUser (params) {
        return axios({
            url: URL_V2 + '/business/search/app/user',
            method: 'get',
            params
        })
    }

    // 绑定app负责人
    bindAppUser (data) {
        return axios({
            url: URL_V2 + '/business/binding/user/app',
            method: 'post',
            data
        })
    }
}

export default new BusinessApi()
