import axios from 'axios'
import Qs from 'qs'
import {URL_V2} from './url'

class UserClass {
    // 获取用户列表
    getUserListWithPagination (params) {
        return axios({
            url: URL_V2 + '/user/lists',
            method: 'get',
            params,
            paramsSerializer: function (params) {
                return Qs.stringify(params, {arrayFormat: 'repeat'})
            }
        })
    }

    createUser (data) {
        return axios({
            url: URL_V2 + '/user/create',
            method: 'post',
            data
        })
    }

    updateUser (data) {
        return axios({
            url: URL_V2 + '/user/update',
            method: 'post',
            data
        })
    }

    deleteUser (id) {
        return axios({
            url: URL_V2 + '/user/delete?user_id=' + id,
            method: 'delete'
        })
    }

    // 检查name是否存在
    checkUserName (userName) {
        return axios({
            url: URL_V2 + '/user/check',
            method: 'get',
            params: {
                username: userName
            }
        })
    }

    // 获取用户详情
    queryUserById (user_id) {
        return axios({
            url: URL_V2 + '/user/detail?user_id=' + user_id,
            method: 'get'
        })
    }

    // 重置密码
    resetUserPassword (data) {
        return axios({
            url: URL_V2 + '/user/passwd/reset',
            method: 'post',
            data
        })
    }

    // 修改密码
    changeUserPassword (data) {
        return axios({
            url: URL_V2 + '/user/passwd/modify',
            method: 'post',
            data
        })
    }

    // 同步用户
    syncADUser (data) {
        return axios({
            url: URL_V2 + '/sys/sync/user',
            method: 'post',
            data
        })
    }

    checkEmailExist (email = '') {
        return axios({
            url: URL_V2 + '/user/domain/check?email=' + email,
            method: 'get'
        })
    }

    // 检查是否是强密码
    checkPasswordStronger (pwd = '') {
      return axios({
        url: `${URL_V2}/user/passwd/check?pwd=${pwd}`,
        method: 'get'
      })
    }
    /*
    *   注册页面的
    *
    */
    // 获取租户列表
    getTenantList (domainId) {
        return axios({
            url: `${URL_V2}/user/register/project/lists?domain_id=${domainId}`,
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

    // 获取子组织机构列表
    getOrgByParent (parentId = '', projectId) {
        return axios({
            url: `${URL_V2}/user/register/orgs?id=${parentId}&project_id=${projectId}`,
            method: 'get'
        })
    }

    // 通过名称模糊搜索/id查找组织机构
    queryOrgByNameOrId (params) {
        return axios({
            url: URL_V2 + '/user/register/org/query',
            method: 'get',
            params
        })
    }

    registerUser (data) {
        return axios({
            url: URL_V2 + '/user/register',
            method: 'post',
            data
        })
    }

    registerCheckEmailExist (email = '') {
        return axios({
            url: URL_V2 + '/user/register/domain/check?email=' + email,
            method: 'get'
        })
    }

    // 检查name是否存在
    registerCheckUserName (userName, domain_id) {
        return axios({
            url: URL_V2 + '/user/register/check',
            method: 'get',
            params: {
                username: userName,
                domain_id: domain_id
            }
        })
    }

    // 检查是否是强密码
    registerCheckPasswordStronger (pwd = '') {
        return axios({
          url: `${URL_V2}/user/register/passwd/check`,
          method: 'post',
          data: {pwd}
        })
    }

    // 获取系统模块
    getModules () {
        return axios({
            url: `${URL_V2}/sys/modules/public?public=0`,
            method: 'get'
        })
    }

    // 获取模块下角色
    getRolesByModuleId (platform = '') {
        return axios({
            url: `${URL_V2}/user/roles?platform=${platform}`,
            method: 'get'
        })
    }

    // 切换用户来源
    switchUserResource (data) {
        return axios({
            url: `${URL_V2}/user/domain/change`,
            method: 'post',
            data
        })
    }

    // UCMP3-6286 是否使用写入AD功能
    ifUseAd () {
        return axios({
            url: `${URL_V2}/sys/ad_user_tag`,
            method: 'get'
        })
    }

    setUserADTag (data) {
        return axios({
            url: `${URL_V2}/user/register/set/tag`,
            method: 'post',
            data
        })
    }

    // 创建用户时可选租户列表
    getCreateUserProject () {
        return axios({
            url: `${URL_V2}/user/project/lists_by_roles`,
            method: 'get'
        })
    }
}

export default new UserClass()
