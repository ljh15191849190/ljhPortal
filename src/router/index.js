import Vue from 'vue'
import Router from 'vue-router'
import Empty from '@/components/empty'
import Waiting from '@/components/Waiting' // 特殊需求
import Login from '@/components/login/Login'
import Content from '@/components/content/Content'
import Organization from '@/components/organization/Organization'
import User from '@/components/user/User'
import Privilege from '@/components/privilege/Privilege'
import System from '@/components/system/System'
import SysConfig from '@/components/sysConfig/SysConfig'
import CopyrightConfig from '@/components/sysConfig/CopyrightConfig'
import Role from '@/components/role/Role'
import Product from '@/components/product/Product'
import EditUser from '@/components/user/EditUser'
import Message from '@/components/message/Message'
import MesgDetail from '@/components/message/MesgDetail'
import HelpCenter from '@/components/helpCenter/HelpCenter'
import ManualLibraryCenter from '@/components/helpCenter/ManualLibraryCenter'

// 消息中心
import MessageCenter from '@/components/messageCenter/MessageCenter'

/**
 * @description 发布消息
 */
import PublishMessage from '@/components/message/PublishMessage'
/**
 * @description 搜索结果
 */
import SearchResult from '@/components/search/SearchResult'
/**
 * @description 租户列表
 */
import TenantList from '@/components/tenant/TenantList'
/**
 * @description 业务列表
 */
import BusinessMgt from '@/components/businessMgt/Business'
/**
 * @description 修改密码
 */
import ChangePassword from '@/components/user/ChangePassword'
/**
 * @description 用户信息
 */
import UserInfo from '@/components/user/UserInfo'

/**
* @description 注册用户
*/
import Register from '@/components/user/register'
//
import store from '../store'
import ProductTabs from '@/components/system/menuManager/ProductTabs'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/waiting',
            name: 'waiting',
            component: Waiting
        },
        {
            path: '/content',
            name: 'content',
            component: Content,
            children: [
                {
                    path: 'change-psd',
                    name: 'changePassword',
                    component: ChangePassword
                },
                {
                    path: 'search-result/:appId/:searchText',
                    name: 'SearchResult',
                    component: SearchResult
                },
                {
                    path: 'helpCenter',
                    name: 'helpCenter',
                    component: HelpCenter
                },
                {
                    path: 'manualLibraryCenter',
                    name: 'manualLibraryCenter',
                    component: ManualLibraryCenter
                },
                {
                    path: 'message',
                    name: 'message',
                    component: Message
                },
                {
                    path: 'message/detail',
                    name: 'mesgdetail',
                    component: MesgDetail
                },
                {
                    path: 'message/publish',
                    name: 'publishMessage',
                    component: PublishMessage
                },
                {
                    path: 'user-info',
                    name: 'userInfo',
                    component: UserInfo
                },
                {
                    path: 'empty',
                    name: 'empty',
                    component: Empty
                },
                {
                    path: 'system',
                    name: 'system',
                    component: System,
                    children: [
                        {
                            path: 'organization',
                            name: 'organization',
                            component: Organization
                        },
                        {
                            path: 'user',
                            name: 'user',
                            component: User
                        },
                        {
                            path: 'business',
                            name: 'business',
                            component: BusinessMgt
                        },
                        {
                            path: 'user/:id',
                            name: 'edituser',
                            component: EditUser
                        },
                        {
                            path: 'role',
                            name: 'role',
                            component: Role
                        },
                        {
                            path: 'privilege',
                            name: 'privilege',
                            component: Privilege
                        },
                        {
                            path: 'sys-config',
                            name: 'sysConfig',
                            component: SysConfig
                        },
                        {
                            path: 'copyright-config',
                            name: 'copyrightConfig',
                            component: CopyrightConfig
                        },
                        {
                            path: 'tenant',
                            name: 'tenant-list',
                            component: TenantList
                        },
                        {
                            path: 'message-center',
                            name: 'messageCenter',
                            component: MessageCenter
                        },
                        {
                            path: 'menus-manager',
                            name: 'menusManager',
                            component: ProductTabs
                        }
                    ]
                },
                {
                    path: 'product/:id',
                    name: 'product',
                    component: Product
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (/^\/content\/message/.test(to.path) && !/^\/content\/message/.test(from.path)) {
        // 保存进入消息中心前的路由
        sessionStorage.setItem('before-message-center', from.path)
    }

    // UCMP3-1744 token超时实例存在时，销毁该实例，token超时模态框单例实现
    if (window._expiredAction && to.path !== '/login') {
        window._expiredAction.delete()
    }

    // 密码是否是第一次使用，未更改
    if (store.state.user.isDefaultPassword && to.path !== '/login' && to.path !== '/content/change-psd') {
        next('/content/change-psd')
    } else if (to.path === '/') {
        if (localStorage.getItem('authenticationToken')) {
            next('/content')
        } else next('/login')
    } else next()
})
router.afterEach((to, from) => {
    // 保存当前路由信息
    sessionStorage.setItem('portal-router-path', to.fullPath)
})

export default router
