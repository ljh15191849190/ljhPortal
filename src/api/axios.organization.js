import axios from 'axios'
import {URL_V2} from './url'

class Organization {
    // 获取组织机构标识
    getOrgtag (params) {
        return axios({
            url: URL_V2 + '/user/org/tag',
            method: 'get',
            params
        })
    }
    // 创建组织机构
    createOrg (data) {
        return axios({
            url: URL_V2 + '/user/org/create',
            method: 'post',
            data
        })
    }

    // 删除组织机构
    deleteOrg (data) {
        return axios({
            url: URL_V2 + '/user/org/del',
            method: 'delete',
            data
        })
    }

    // 更新组织机构
    updateOrg (data) {
        return axios({
            url: URL_V2 + '/user/org/update',
            method: 'post',
            data
        })
    }
    // 绑定组织机构
    BindingOrg (data) {
        return axios({
            url: URL_V2 + '/user/tag/org',
            method: 'post',
            data
        })
    }
    // 获取子组织机构列表
    getOrgByParent (parentId = '', projectId) {
        return axios({
            url: `${URL_V2}/user/orgs?id=${parentId}&project_id=${projectId}`,
            method: 'get'
        })
    }

    // 通过名称模糊搜索/id查找组织机构
    queryOrgByNameOrId (params) {
        return axios({
            url: URL_V2 + '/user/org/query',
            method: 'get',
            params
        })
    }

    // 检查是否重名
    checkOrgName (orgName, projectId, parentId) {
        return axios({
            url: URL_V2 + '/user/orgname/check',
            method: 'get',
            params: {
                project_id: projectId,
                org_name: orgName,
                parent_org_id: parentId
            }
        })
    }

    // 同步组织机构
    syncOrg (data) {
        return axios({
            url: URL_V2 + '/sys/sync/org',
            method: 'post',
            data
        })
    }

    // 获取组织机构树（应用授权）
    getOrgTree () {
        return axios({
            url: URL_V2 + '/user/orgtree',
            method: 'get'
        })
    }

    // 获取自动同步参数
    getBaseDn (sync_info = '') {
        return axios({
            url: `${URL_V2}/sys/ldap/base_dn?sync_info=${sync_info}`,
            method: 'get'
        })
    }
}

export default new Organization()
