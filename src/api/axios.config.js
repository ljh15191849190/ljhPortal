import axios from 'axios'
import {Notification} from 'element-ui'
// import Utils from '@server/utils'
import Modal from '@server/expired.modal'
import store from '../store'

export default function () {
    /* eslint-disable */
    axios.interceptors.request.use(
        config => {
            // 登录接口不需要token信息
            if (config.url !== '/gd/v2/user/login') {
                //请求拦截，没有token情况跳转登录
                //原子作业平台ATOMFLOWAT-153(复制原子作业平台中的http地址，到另一个浏览器中打开的时候，直接报错)
                let token = localStorage.getItem('authenticationToken')
                if (token) {
                    config.headers.common['X-Subject-Token'] = token
                }
            }

            if (config.params)
                config.params.timestamp = Date.now()
            return config
        }, err => {
            return Promise.reject(err)
        }
    )

    axios.interceptors.response.use(
        response => {
            if (response.headers && response.headers['x-subject-token'] && response.headers['x-subject-token'] !== 'None') {
                localStorage.setItem('authenticationToken', response.headers['x-subject-token'])
            }

            return response.data.data
        }, err => {
            // UCMP3-372 从AD同步过来的用户，没有分配角色，直接登录，接口报代码错误，需要优化一下，给出比较容易理解的提示
            // login界面没有authenticationToken， 登录接口应该也把错误处理暴露出来
            // if (!localStorage.getItem('authenticationToken')) {
            //     return
            // }
            if (err.response.status === 401) {
                window._expiredAction.open()
                return Promise.reject(err)
                // 处理未获授权的场景，跳转到empty提示页面
            } else if (err.response.status === 403) {
                //原子作业平台ATOMFLOWAT-144(创建一个用户没有分配角色，用此账号登录之后，报未授权，并且还显示脚本列表)
                Notification.warning({
                    title: '温馨提示：',
                    message: '没有权限, 请联系管理员!'
                })
                return Promise.reject(err)
            }
            let msg = '服务发生异常'
            if (err.response && err.response.data && (err.response.data.cn_msg || err.response.data.msg)) {
                msg = err.response.data.cn_msg || err.response.data.msg
            }
            // UCMP3-1712【系统管理】清空缓存后，首次访问系统页面报错
            // 解决方法：清除token时, 错误处理暴露给控制台，但是不要暴露给用户
            if (localStorage.getItem('authenticationToken')) {
                Notification.error({
                    title: '错误',
                    message: msg
                })
            }
            return Promise.reject(err)
        }
    )

    let expiredModal = (function () {
        let instance
        return function () {
            return instance || (instance = new Modal())
        }
    })()

    window._expiredAction = {
        setMadal: null,
        open: function () {
            this.setMadal = expiredModal()
            this.setMadal.create()
        },
        delete: function () {
            this.setMadal ? this.setMadal.delete() : ''
        }
    }
    // 框架内部发生401未认证的请求
    window.addEventListener('message', res => {
        if (res.data.status === 401 && localStorage.getItem('domainId')) {
            window._expiredAction.open()
        }

        // 自定义session失效处理
        if (res.data.status === 601 && localStorage.getItem('domainId')) {
            // 防止多次弹窗(因页面iframe同时会存在两个项目，除了所在系统管理子项目时)
            localStorage.removeItem('domainId')
            // session失效刷新页面需要作标记处理
            sessionStorage.setItem('session_invalid', true)
            window._expiredAction.open()
        }
        // 隐藏顶部导航栏
        if (res.data.status === 'hideNavBar') {
            // Utils.requestFullScreen()
            store.dispatch('setTopNavBarDisplay', false)
        }
        // 显示顶部导航栏
        if (res.data.status === 'showNavBar') {
            store.dispatch('setTopNavBarDisplay', true)
        }
    })
}
