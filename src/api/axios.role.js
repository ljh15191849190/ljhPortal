import axios from 'axios'
import {URL_V2, UCMP} from './url'

class Role {
    // 获取角色列表
    getRoleList (projectId, page, limit, keyword) {
        return axios({
            url: URL_V2 + '/user/roles/lists',
            method: 'get',
            params: {
                project_id: projectId,
                page,
                limit,
                name: keyword,
                timestemp: new Date().getTime()
            }
        })
    }

    // 获取可分配角色列表
    getAllowRoleList (projectId) {
        return axios({
            url: URL_V2 + '/user/roles/allow/lists',
            method: 'get',
            params: {
                project_id: projectId
            }
        })
    }

    // 创建角色
    createRole (data) {
        return axios({
            url: URL_V2 + '/user/roles/create',
            method: 'post',
            data
        })
    }

    // 修改角色
    updateRole (data) {
        return axios({
            url: URL_V2 + '/user/roles/update',
            method: 'post',
            data
        })
    }

    // 删除角色
    deleteRole (roleId) {
        return axios({
            url: URL_V2 + '/user/roles/delete?role_id=' + roleId,
            method: 'delete'
        })
    }

    // 获取当前操作人可以赋值的某个应用平台的权限列表
    getPlatformRoleListByOperator (platform) {
        return axios({
            url: URL_V2 + '/user/roles/kinds?platform=' + platform,
            method: 'get'
        })
    }

    // 检查重名
    checkRoleName (name) {
        return axios({
            url: URL_V2 + '/user/roles/check',
            method: 'get',
            params: {
                role_name: name
            }
        })
    }

    getRoleByRoleId (roleId) {
        return axios({
            url: URL_V2 + '/user/roles/detail?role_id=' + roleId,
            method: 'get'
        })
    }

    // 为用户分配角色
    assignRolesForUser (data) {
        return axios({
            url: URL_V2 + '/user/roles/assign',
            method: 'post',
            data
        })
    }

    updateUserAuthority (data) {
        return axios({
            url: UCMP + 'user_instance',
            method: 'PUT',
            data
        })
    }

    getRoleDetailByUser (userId) {
        return axios({
            url: URL_V2 + '/user/roles/assigned?user_id=' + userId,
            method: 'get'
        })
    }
}

export default new Role()
