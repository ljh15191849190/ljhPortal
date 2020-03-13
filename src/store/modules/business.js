import * as types from '../mutations_types'

/**
 * @description 站内消息
 */
export default {
    state: {
        appDialogVisible: false,
        appDialogData: {},
        updatedAppDialogData: {},
        isAppEditType: false
    },
    getters: {
        appDialogVisible: state => state.appDialogVisible,
        appDialogData: state => state.appDialogData,
        isAppEditType: state => state.isAppEditType,
        updatedAppDialogData: state => state.updatedAppDialogData
    },
    actions: {},
    mutations: {
        [types.CHANGE_APP_DIALOG_VISIBLE] (state, flag) {
            state.appDialogVisible = flag
        },
        [types.SET_APP_DIALOG_DATA] (state, data) {
            state.appDialogData = data
        },
        [types.SET_IS_APP_EDIT_TYPE] (state, flag) {
            state.isAppEditType = flag
        },
        [types.SET_UPDATED_APP_DIALOG_DATA] (state, data) {
            state.updatedAppDialogData = data
        }
    }
}
