import {MessageBox} from 'element-ui'
import Utils from '@server/utils'

/**
 * @description token超时后弹出模态框提示，单例模式实现
 */
let Modal = function () {
    this.open = false
}

Modal.prototype.create = function () {
    if (this.open) {
        return
    }
    MessageBox.alert('会话超时，即将跳转至登录页面', '提示', {
        confirmButtonText: '确定',
        customClass: 'expired_modal',
        callback: action => {
            Utils.tokenExpired()
        }
    })
    this.open = true
}

Modal.prototype.delete = function () {
    this.open = false
}

export default Modal
