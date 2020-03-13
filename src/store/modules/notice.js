import * as types from '../mutations_types'

/**
 * @description 站内消息
 */
export default {
    state: {
        selectedNotice: {},
        notReadNotice: [],
        notReadNoticeCount: 0
    },
    getters: {
        selectedNotice: state => state.selectedNotice,
        notReadNotice: state => state.notReadNotice,
        notReadNoticeCount: state => state.notReadNoticeCount
    },
    actions: {
        setSelectedNotice ({commit, state}, notice) {
            commit(types.SET_SELECTED_NOTICE, notice)
        },

        setNotReadNotice ({commit, state}, list) {
            commit(types.SET_NOT_READ_NOTICE, list)
        },

        setNotReadNoticeCount ({commit, state}, count) {
            commit(types.SET_NOT_READ_NOTICE_COUNT, count)
        }
    },
    mutations: {
        [types.SET_SELECTED_NOTICE] (state, notice) {
            state.selectedNotice = notice
        },

        [types.SET_NOT_READ_NOTICE] (state, list) {
            state.notReadNotice = list
        },

        [types.SET_NOT_READ_NOTICE_COUNT] (state, count) {
            state.notReadNoticeCount = count
        }
    }
}
