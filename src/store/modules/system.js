import * as types from '../mutations_types'
import Utils from '@server/utils'

/**
 * @description 系统配置模块(包括：系统logo，系统标题，版权信息)
 */
const SYSTEM = {
    state: {
        system: {
            id: '',
            sys_name: 'IT运营管理中枢',
            sys_logo: '',
            copyright: '',
            log_delete_time: '',
            surport_mail: '',
            surport_tel: '',
            version: '',
            pwd_rules: '',
            case_sensitive: 1,
            session_expire: 30,
            license_expire: 7
        },
        apps: [],
        topNavBarDisplay: true,
        customMenus: [],
        timerForLicense: null,
        jumpDetailHref: '',
        domainList: [], //用户来源列表
        businessOrproject: ''
    },
    getters: {
        system: state => state.system,
        apps: state => state.apps,
        topNavBarDisplay: state => state.topNavBarDisplay,
        customMenus: state => state.customMenus,
        jumpDetailHref: state => state.jumpDetailHref,
        domainList: state => state.domainList,
        businessOrproject: state => state.businessOrproject
    },
    actions: {
        setSystemInfo ({commit, state}, system) {
            commit(types.SET_SYSTEM, system)
        },
        setSystemApp ({commit, state}, apps) {
            commit(types.SET_APPS, apps)
        },
        setTopNavBarDisplay ({commit, state}, status) {
            commit(types.SET_TOPNAVBAR_DISPLAY, status)
        },
        setCustomMenus ({commit, state}, customMenus) {
            commit(types.SET_CUSTOM_MENU, customMenus)
        },
        setLicenseInterval ({commit, state}, timer) {
            commit(types.SET_LICENSE_INTERVAL, timer)
        },
        clearLicenseInterval ({commit, state}) {
            commit(types.CLEAR_LICENSE_INTERVAL)
        },
        setJumpDetailHref ({commit, state}, href) {
            commit(types.JUMP_DETAIL_HREF, href)
        },
        setDomainList ({commit, state}, domains) {
            commit(types.SET_DOMAIN_LIST, domains)
        },
        setBusinessOrproject ({commit, state}, status) {
            commit(types.SET_BUSINESSORPROJECT_TYPE, status)
        }
    },
    mutations: {
        [types.SET_SYSTEM] (state, system) {
            let systemCopy = Object.assign({}, system)
            systemCopy.sys_logo = Utils.logoUrl(system.sys_logo)
            systemCopy.login_background = systemCopy.login_background.map(item => {
                return Utils.logoUrl(item)
            })
            state.system = systemCopy
        },
        [types.SET_APPS] (state, apps) {
            state.apps = apps
        },
        [types.SET_TOPNAVBAR_DISPLAY] (state, apps) {
            state.topNavBarDisplay = apps
        },
        [types.SET_CUSTOM_MENU] (state, customMenus) {
            state.customMenus = customMenus
        },
        [types.SET_LICENSE_INTERVAL] (state, timer) {
            state.timerForLicense = timer
        },
        [types.CLEAR_LICENSE_INTERVAL] (state) {
            clearInterval(state.timerForLicense)
        },
        [types.JUMP_DETAIL_HREF] (state, href) {
            state.jumpDetailHref = href
        },
        [types.SET_DOMAIN_LIST] (state, domains) {
            state.domainList = domains
        },
        [types.SET_BUSINESSORPROJECT_TYPE] (state, status) {
            state.businessOrproject = status
        }
    }
}

export default SYSTEM
