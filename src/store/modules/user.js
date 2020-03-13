import * as types from '../mutations_types'
import Utils from '@/server/utils'

export default {
    state: {
        isDefaultPassword: false,
        tenantList: [],
        currentTenantName: '',
        checkoutProject: false
    },
    getters: {
        tenantList: state => state.tenantList,
        currentTenantName: state => state.currentTenantName,
        checkoutProject: state => state.checkoutProject
    },
    actions: {
        setIsDefaultPassword ({commit, state}, flag) {
            commit(types.SET_IS_DEFAULT_PASSWORD, flag)
        },
        setCheckoutProject ({commit, state}, flag) {
            commit(types.SET_CHECKOUT_PROJECT, flag)
        },
        setTenantList ({commit, state}, list) {
            commit(types.SET_TENANT_LIST, list)
        },
        setCurrentTenantName ({commit, state}, name) {
            commit(types.SET_CURRENT_TENANT_NAME, name)
        }
    },
    mutations: {
        [types.SET_IS_DEFAULT_PASSWORD] (state, flag) {
            state.isDefaultPassword = flag
        },
        [types.SET_CHECKOUT_PROJECT] (state, flag) {
            state.checkoutProject = flag
        },
        [types.SET_TENANT_LIST] (state, list) {
            // 排序，避免创建用户时租户顺序和租户列表不一致
            let sortedData = Utils.sortTable(list, 'name')
            state.tenantList = sortedData
        },
        [types.SET_CURRENT_TENANT_NAME] (state, name) {
            state.currentTenantName = name
        }
    }
}
