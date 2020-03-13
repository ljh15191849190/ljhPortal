import axios from 'axios'
import {URL_V2} from './url'

class Menu {
    // 获取系统全部菜单接口
    getMenu (params) {
        return axios({
            url: URL_V2 + '/sys/menus',
            method: 'get',
            params
        })
    }

    // 获取用户菜单接口
    queryMenuByUser () {
        return axios({
            url: URL_V2 + '/sys/user/menus',
            method: 'get'
        })
    }

    // 获取角色勾选菜单
    getMenuByRole (id) {
        return axios({
            url: URL_V2 + '/sys/role/menus?role_id=' + id,
            method: 'get'
        })
    }

    // 获取Module接口(旧版中APP)
    getAppSysList (projectId) {
        return axios({
            url: URL_V2 + '/sys/modules?project_id=' + projectId,
            method: 'get'
        })
    }

    getPublicApps (_public) {
        return axios({
            url: URL_V2 + '/sys/modules/public?public=' + _public,
            method: 'get'
        })
    }

    // 校验指定菜单名称是否已经存在
    getMenusAccordToApp (moduleId) {
        return axios({
            url: URL_V2 + '/sys/menu/list?sys_module_id=' + moduleId,
            method: 'get'
        })
    }

    validateRepeatedMenuName (name) {
        return axios({
            url: URL_V2 + '/sys/menu/title/check?title=' + name,
            method: 'get'
        })
    }

    // 创建一级菜单
    addSubMenu (data) {
        return axios({
            url: URL_V2 + '/sys/menu/create/sub',
            method: 'post',
            data
        })
    }

    // 创建一级菜单    
    addMenu (data) {
        return axios({
            url: URL_V2 + '/sys/menu/create',
            method: 'post',
            data
        })
    }

    // 修改更新菜单
    updateMenu (data) {
        return axios({
            url: URL_V2 + '/sys/menu/update',
            method: 'put',
            data
        })
    }

    // 删除菜单
    deleteMenu (data) {
        return axios({
            url: URL_V2 + '/sys/menu/delete',
            method: 'delete',
            data
        })
    }

    // 业务或者项目
    businessOrproject () {
        return axios({
            url: URL_V2 + '/business/choose/name',
            method: 'get'
        })
    }
}

export default new Menu()
