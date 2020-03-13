<template lang="pug">
    div.content.full-content(:class="{'full-height': !topNavBarDisplay}")
        el-menu.sys-menu(
        v-if="topNavBarDisplay"
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        text-color="#333")
            li.el-menu-item.official
                img(:src="system.sys_logo")
                span {{system.sys_name}}
            el-submenu.function(index="function")
                template(slot="title") {{functionMenuItemName}}
                div.drop-menu
                    div.drop-menu-content
                        div.drop-menu-item(v-for="(apppItem, navbar) in customMenus" :key="navbar")
                            div.title(@click="handleSelect(apppItem.appUrl)") {{apppItem.appName}}
                            div.menu-pane
                                div(v-for="(subItem, navbar) in apppItem.subMenu" :key="navbar")
                                    div(v-for="(item, navbar) in subItem.menus" :key="navbar")
                                        div.menu(v-if="item.checked" @click="goMenu(apppItem.appUrl, item.menuUrl, subItem.url, item.menu_source)") {{item.title}}
                    div.drop-menu-footer
                        div.custom-pane(@click="popCustomDialog")
                            i.icon-button(class="portal-icon-custom")
                            span.custom 自定义

        <!-- 搜索 -->
        //div.search-pane
            el-collapse-transition
                el-input.inner-search-input(v-show="showSearchBar" placeholder="请输入查询"  v-model="searchTxt" size="small" )
                    el-select(v-model="searchApp" slot="prepend")
                        el-option(v-for="item in customMenus" :key="item.id" :label="item.appName" :value="item.id")
            el-button.search(icon="portal-icon-search" @click="intoSearchPage")
        <!-- 工具栏 -->
        div.tools-box
            el-tooltip(content="服务目录" placement="bottom" v-if="isShowApplyService")
                div.service-icon.portal-icon-service(@click="applyService")
            el-tooltip(content="工单" placement="bottom" v-if="isShowTicket")
                div.service-icon.portal-icon-ticket(@click="goTicket")

            MessageBox
            el-tooltip(content="帮助中心" placement="bottom")
                div.service-icon.portal-icon-bangzhuzhongxin(@click="toHelpCenter")
            el-tooltip(content="知识库" placement="bottom")
                div.service-icon.portal-icon-manual-library(@click="toManualLibraryCenter")
            <!-- 用户 -->
            el-dropdown.user-config(@visible-change="userVisible")
                div
                    span.user-avatar
                        i.service-icon.portal-icon-avatar
                    span {{user.name}}
                el-dropdown-menu(slot="dropdown")
                    div.user-config__wrap
                        div.user-config__item(@click="goUserInfo")
                            i.portal-icon-user-manager
                            span.info-text 用户信息
                        div.user-config__item
                            i.portal-icon-tenement
                            span.info-text 租户: {{currentTenantName}}
                        div.user-config__item.exit(v-if="checkoutProject" @click="openSwitchTenant")
                            i.portal-icon-sys-config
                            span.info-text 切换租户
                        div.user-config__item(@click="switchUserResourceDialog = true")
                            i.portal-icon-sys-config
                            span.info-text 切换用户来源
                        div.user-config__item(@click="exit")
                            i.portal-icon-close
                            span.info-text 退出

        Custom-Dialog(v-if="customVisble" :visible="customVisble" :activeApp="activeIndex" @closeDialog="closeDialog")
        div.portal-container-frame(:class="{'full-height': !topNavBarDisplay}")
            router-view(v-if="$route.query.timestamp")
            router-view(v-else)
        div.portal-footer(v-show="topNavBarDisplay")
            p.footer-content {{system.copyright}}

        el-dialog(v-if="switchTenantDialog" :visible.sync="switchTenantDialog" title="切换租户")
            el-table(ref="tenantTable" :data="tenantAvailableList" @current-change="tenantSelectChange" size="small" highlight-current-row)
                el-table-column(v-for="column in tenantListColumns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" show-overflow-tooltip)
            span(slot="footer")
                el-button(size="small" @click="closeSwitchTenantDialog") 取消
                el-button(size="small" type="primary" @click="switchTenant" :disabled="!tenantSelected") 切换
        el-dialog(v-if="switchUserResourceDialog" :visible.sync="switchUserResourceDialog" title="切换用户来源", @close="handleUserResourceClose", width="20%")
            el-form(label-width="80px")
                el-form-item(label="用户来源")
                    el-select(v-model="activeDomain" size="small"  @change="getTenantListByDomainId")
                        el-option(v-for="domain in domains"  :value="domain.id"  :label="domain.name"  :key="domain.id")
                el-form-item(label="租户")
                    el-select(v-model="activeUser"  size="small"  :disabled="!activeDomain" :placeholder="activeDomain ? '请选择' : '请选择用户来源'")
                        el-option(v-for="user in userList"  :value="user.id"  :label="user.name"  :key="user.id")
            footer(slot="footer")
                el-button(@click="handleSwitchUserResource", :disabled="!activeUser", type="primary", size="small") 切换
                el-button(@click="handleUserResourceClose", size="small") 取消
</template>
<script>
    import MessageBox from '@/components/message/MessageBox'
    import LoginApi from '@api/axios.login'
    import MenuApi from '@api/axios.menu'
    import OprApi from '@api/axios.configuration'
    import UserApi from '@api/axios.users'
    import TenantApi from '@api/axios.tenant'
    import CustomDialog from './CustomDialog'
    import Utils from '@server/utils'
    import {mapActions, mapGetters} from 'vuex'

    export default {
        inject: ['reload'],
        data () {
            return {
                showSearchBar: false,
                apps: [],
                menuItems: [],
                activeIndex: '',
                defaultFunctionMenuName: '功能中心',
                user: {
                    name: '',
                    roleName: '云平台管理员'
                },
                systemInfo: {},
                searchApp: '',
                searchTxt: '',
                customVisble: false,
                customMenuList: [],
                showTenant: false,
                currentTenantId: localStorage.getItem('tenant'),
                promise: null,
                promiseCPU: null,
                isExiting: false,
                LICENSE_CHECK_TIME: 10 * 60 * 1000, // 授权轮询时间
                switchTenantDialog: false,
                tenantListColumns: [
                    {prop: 'name', label: '租户名称'},
                    {prop: 'description', label: '描述'}
                ],
                tenantSelected: null,
                switchUserResourceDialog: false, //切换用户来源
                domains: [], //用户来源列表
                activeDomain: '',
                activeUser: '',
                userList: []
            }
        },
        methods: {
            init () {
                MenuApi.getAppSysList(this.currentTenantId).then(res => {
                    this.apps = res
                    this.menuItems = res.map(item => {
                        return {
                            id: item.id,
                            prop: item.module_url,
                            remote_url: item.remote_url,
                            label: item.module_name
                        }
                    })

                    this.setSystemApp(this.menuItems)
                    let storageIndex = sessionStorage.getItem('portal-route-navbar')
                    let storageRoute = sessionStorage.getItem('portal-router-path')

                    this.getMenus(() => {
                        if (storageIndex) {
                            this.activeIndex = storageIndex
                        } else {
                            // 过滤过以后存在menu的product的第一项
                            this.activeIndex = this.customMenuList[0] ? this.customMenuList[0].appUrl : ''
                            sessionStorage.setItem('portal-route-navbar', this.activeIndex)
                            sessionStorage.setItem('portal-app-id', this.getAppId(this.activeIndex))
                        }

                        // url地址只剩下host加端口，回车加载到可进入的第一个产品
                        if (storageRoute === '/content') {
                            this.pollingLicense()
                            this.activeIndex = this.customMenuList[0] ? this.customMenuList[0].appUrl : 'ucmp'

                            this.handleSelect(this.activeIndex)
                        } else {
                            // 如果意外刷新，以sessionStorage保存的路由信息为准
                            let reg = /^\/content\/.+/g
                            if (storageRoute && reg.test(storageRoute)) {
                                this.checkLicense(() => {
                                    this.$router.push(storageRoute)

                                    this.pollingLicense()
                                })
                                return
                            }

                            this.checkLicense(() => {
                                this.$router.push('/content/product/' + this.activeIndex)

                                this.pollingLicense()
                            })
                        }
                    })
                })
            },
            /**
             * @description 轮询 授权
             */
            pollingLicense () {
                this.clearLicenseInterval()
                const timer = setInterval(() => {
                    this.checkLicense()
                }, this.LICENSE_CHECK_TIME)
                this.setLicenseInterval(timer)
            },
            handleSelect (index) {
                if (index === 'roleInfo' || index === 'index') {
                    return
                }

                this.activeIndex = index
                let appId = this.getAppId(this.activeIndex)
                sessionStorage.setItem('portal-route-navbar', this.activeIndex)
                sessionStorage.setItem('portal-app-id', appId)

                // 加载定时器轮询授权
                this.checkLicense()
                this.pollingLicense()

                // UCMP3-4832【UCMP】登录系统后，在企业通用云管理平台其他页面，浏览器地址栏只保留IP+端口，回车后跳转不到总览页面
                // 问题原因: 代码修该造成
                // 解决了浏览器地址栏只保留IP+端口问题及app切换回不到总览
                if (this.activeIndex === 'ucmp') {
                    // 是否有总览
                    if (this.customMenuList[0].subMenu && this.customMenuList[0].subMenu.length) {
                        for (let index = 0; index < this.customMenuList[0].subMenu.length; index++) {
                            const menus = this.customMenuList[0].subMenu[index].menus
                            if (menus) {
                                let dashboardMenu = menus.find(item => item.menuUrl === 'dashboard')
                                if (dashboardMenu) {
                                    // 如果是ucmp, 有总览菜单, 需要保存selectedMenu
                                    sessionStorage.setItem('selectedMenu', dashboardMenu.menuUrl)
                                    break
                                }
                            } else {
                                continue
                            }
                        }
                    }
                }
                // 如果当前激活的菜单项是产品
                if (this.productMenuItemProps.indexOf(this.activeIndex) !== -1 && this.ifProduct) {
                    // 加timestamp 确保在无左侧菜单时可以返回
                    this.$router.push('/content/product/' + this.activeIndex + '?timestamp=' + new Date().getTime())
                    if (this.activeIndex === 'atomflow') {
                        sessionStorage.setItem('atomflow-router-path', '')
                    }
                    return
                }

                if (this.activeIndex === 'system') {
                    // 加timestamp 确保在无左侧菜单时可以返回
                    // UCMP3-3322 取消默认跳转至用户管理
                    let currentUrl = sessionStorage.getItem('portal-router-path')
                    if (currentUrl.indexOf('/content/system') > -1) {
                        currentUrl = currentUrl.replace(/\?timestamp=[\d]*/g, '')
                        this.$router.push(currentUrl + '?timestamp=' + new Date().getTime())
                    } else {
                        this.$router.push('/content/system?timestamp=' + new Date().getTime())
                    }
                }
                // this.$router.push('/content/' + this.activeIndex)
            },
            checkLicense (cb) {
                // UCMP-1195【授权】系统管理授模块权提示应去掉。
                if (this.activeIndex === 'system') {
                    cb && cb()
                    return
                }

                const appId = this.getAppId(this.activeIndex)

                // UCMP3-3067 切换租户的过程中，报错need appid
                if (!appId) return

                OprApi.getLicense(appId).then(res => {
                    if (!res || res.status !== 'active') {
                        // 没有授权信息， 过期
                        if (this.promise) return

                        // license为假，存入本地
                        localStorage.setItem(`${this.activeIndex}_license`, 'expired')

                        this.promise = this.$confirm('您的【' + this.functionMenuItemName + '】授权已过期！', '警告', {
                            type: 'warning',
                            showConfirmButton: false,
                            showCancelButton: false
                        }).catch(() => {
                            this.promise = null
                        })
                    } else {
                        // license为真，存入本地
                        localStorage.setItem(`${this.activeIndex}_license`, 'active')

                        // 超过CPU核数
                        const getCPULeftItem = res.authItem.find(item => {
                            return item.type === '物理机CPU核数'
                        })

                        if (getCPULeftItem && getCPULeftItem.left <= 0) {
                            if (this.promiseCPU) return

                            this.promiseCPU = this.$confirm('您的【' + this.functionMenuItemName + '】CPU核数已超出！', '警告', {
                                type: 'warning',
                                showConfirmButton: false,
                                showCancelButton: false
                            }).catch(() => {
                                this.promiseCPU = null
                            })
                        }

                        // 7天及 内 提示
                        const getActiveLeftItem = res.authItem.find(item => {
                            return item.type === '有效截止日期'
                        })

                        if (getActiveLeftItem && getActiveLeftItem.left <= 7) {
                            this.$notify({
                                message: '您的【' + this.functionMenuItemName + '】授权还有' + (getActiveLeftItem.left || 0) + '天到期！',
                                type: 'warning'
                            })
                        }
                    }

                    // 过期亦不影响使用
                    cb && cb()
                })
            },
            /**
             * @description 退出
             */
            exit () {
                // UCMP3-938【系统管理】登录用户连着点击两次退出，第二次会报“没有权限，请联系管理员”，需优化修改
                if (this.isExiting) return

                this.isExiting = true
                LoginApi.logout().then(res => {
                    this.isExiting = false
                    this.$notify({
                        type: 'success',
                        message: '退出登录'
                    })

                    // 退出时应该清理license验证（不存在token了）
                    this.clearLicenseInterval()
                    Utils.tokenExpired()
                })
            },
            getAppId (appUrl) {
                let appId = ''
                this.apps.forEach(item => {
                    if (item.module_url === appUrl) {
                        appId = item.id
                    }
                })

                return appId
            },
            /**
             * @description 跳转相应的路由
             * @param [appUrl] 模块地址如: 'atomflow'(分布式作业管理与作业编排); [menuUrl]二级菜单
             */
            goMenu (appUrl, menuUrl, consoleUrl, menu_source) {
                let isCurrentProduct = appUrl === this.activeIndex
                if (!isCurrentProduct) {
                    this.handleSelect(appUrl)

                    if (appUrl !== 'system') {
                        // 等DOM渲染Product组件
                        this.$nextTick(() => {
                            // 等待iframe loaded
                            document.getElementById('portal-content-frame').onload = () => {
                                sessionStorage.setItem('selectedMenu', menuUrl)
                                window.frames[0].postMessage({selectdCustomMenu: menuUrl, menu_source}, '*')
                            }
                        })
                    } else {
                        this.$router.push(menuUrl)
                    }
                } else {
                    if (appUrl !== 'system') {
                        sessionStorage.removeItem('selectedMenu')
                        window.frames[0].postMessage({selectdCustomMenu: menuUrl, consoleUrl: consoleUrl, menu_source}, '*')
                    } else {
                        this.$router.push(menuUrl)
                    }
                }
            },
            /**
             * @description 获取菜单
             */
            getMenus (cb) {
                MenuApi.queryMenuByUser().then(res => {
                    // 从当前菜单栏数据列表中筛选出产品id集合
                    let allMenuAppIds = Array.from(new Set(res.map(
                        item => {
                            return item.sys_module_id
                        }
                    )))

                    // 过滤当前用户能看见的产品列表
                    this.apps = JSON.parse(JSON.stringify(this.apps)).filter(
                        app => {
                            // eslint-disable-next-line
                            if (allMenuAppIds.indexOf(app.id) !== -1)
                                return app
                        }
                    )
                    this.customMenuList = this.apps.map(app => {
                        let appItem = {
                            appUrl: app.module_url,
                            appName: app.module_name,
                            id: app.id,
                            subMenu: []
                        }
                        res.forEach(menu => {
                            // 在双层循环里只取 父ucmp，子总览这一次删除掉总览的子菜单，使得可以设置一个同名子checkbox
                            if (app.module_url === 'ucmp' && menu.title === '总览') {
                                menu.subMenus = []
                            }

                            if (app.id === menu.sys_module_id) {
                                //如果菜单有子菜单
                                if (menu.subMenus && menu.subMenus.length) {
                                    let itemArr = []
                                    menu.subMenus.forEach(subMenuItem => {
                                        let item = {
                                            appId: menu.sys_module_id,
                                            title: subMenuItem.title,
                                            menuUrl: subMenuItem.url,
                                            menu_source: subMenuItem.menu_source,
                                            //自定义爱好，之后根据接口，目前暂自定义为checked,且本地存储处理
                                            checked: this.getCustomStatus(subMenuItem.url)
                                        }
                                        itemArr.push(item)
                                    })

                                    let menuItem = {
                                        menu_source: menu.menu_source,
                                        url: menu.url,
                                        subTitle: menu.title,
                                        menus: itemArr
                                    }
                                    appItem.subMenu.push(menuItem)
                                } else {
                                    let item = {
                                        title: menu.title,
                                        menuUrl: menu.url,
                                        menu_source: menu.menu_source,
                                        checked: this.getCustomStatus(menu.url)
                                    }
                                    let menuItem = {
                                        subTitle: menu.title,
                                        menus: [item]
                                    }
                                    appItem.subMenu.push(menuItem)
                                }
                            }
                        })

                        return appItem
                    })

                    this.setCustomMenus(this.customMenuList)

                    if (cb) cb()
                })
            },
            getCustomStatus (url) {
                const systemUserName = localStorage.getItem('systemUserName')
                let customMenus = localStorage.getItem('customMenus_' + systemUserName)
                if (customMenus) {
                    customMenus = JSON.parse(customMenus)
                    for (let index = 0, len = customMenus.length; index < len; index++) {
                        for (let j = 0, len = customMenus[index].subMenu.length; j < len; j++) {
                            let menus = customMenus[index].subMenu[j].menus
                            for (let key = 0; key < menus.length; key++) {
                                if (url === menus[key].menuUrl) {
                                    return menus[key].checked
                                }
                            }
                        }
                    }
                }
                return false
            },
            /**
             * @description 自定义弹框弹出
             */
            popCustomDialog () {
                this.customVisble = true
            },
            /**
             * @description 自定义弹框关闭
             */
            closeDialog () {
                this.customVisble = false
            },
            intoSearchPage () {
                if (this.showSearchBar) {
                    const searchText = this.searchTxt
                    if (searchText === '' || !this.searchApp) return

                    this.showSearchBar = false
                    this.searchTxt = ''
                    this.$router.push('/content/search-result/' + this.searchApp + '/' + searchText)
                } else this.showSearchBar = true
            },
            getTenantList () {
                TenantApi.getTenantList().then(res => {
                    this.setTenantList(res)
                    const currentTenant = res.find(item => item.id === this.currentTenantId)
                    this.setCurrentTenantName(currentTenant ? currentTenant.name : '')
                })
            },
            openSwitchTenant () {
                this.switchTenantDialog = true
            },
            closeSwitchTenantDialog () {
                this.switchTenantDialog = false
                this.tenantSelected = null
            },
            tenantSelectChange (currentRow, oldCurrentRow) {
                this.tenantSelected = currentRow
            },
            /**
             * @description 切换租户
             */
            switchTenant () {
                let tenantId = this.tenantSelected.id
                TenantApi.switchTenant(tenantId).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '切换租户成功'
                    })

                    localStorage.setItem('tenant', tenantId)
                    this.currentTenantId = tenantId
                    let currentTenant = this.tenantList.find(item => item.id === this.currentTenantId)
                    this.setCurrentTenantName(currentTenant ? currentTenant.name : '')

                    this.closeSwitchTenantDialog()

                    this.reload()
                })
            },
            userVisible (visible) {
                if (!visible) this.showTenant = false
            },
            /**
             * @description 通过用户姓名获取用户信息，然后获取用户默认租户
             */
            getUserByName () {
                // const domainId = localStorage.getItem('domainId')
                // const name = localStorage.getItem('systemUserName')
                // // const token = localStorage.getItem('authenticationToken')
                //
                // UserApi.queryUserByName(domainId, name).then(res => {
                //     this.currentTenantId = res[0].default_project_id
                //     localStorage.setItem('tenant', res[0].default_project_id)
                //
                //     this.getUserTenantList()
                // })

                // 多租户暂留
                /**
                 // 上次登陆/刷新前/关闭标签页但令牌过期前 使用的租户
                 const lastUsedTenant = localStorage.getItem('token2tenant') ? JSON.parse(localStorage.getItem('token2tenant')) : null

                 // 如果存在，说明令牌未过期，租户未切换，则取令牌对应的租户为当前租户
                 if (lastUsedTenant && lastUsedTenant[token]) {
                    this.currentTenantId = lastUsedTenant[token]
                    localStorage.setItem('tenant', lastUsedTenant[token])
                } else {
                    // 不存在说明 1未登录过 2令牌过期，3租户不同
                    UserApi.queryUserByName(domainId, name).then(res => {
                        this.currentTenantId = res[0].default_project_id
                        localStorage.setItem('tenant', res[0].default_project_id)

                        // 保存当前值 的 令牌：租户对应信息
                        let token2tenant = {[token]: res[0].default_project_id}
                        localStorage.setItem('token2tenant', JSON.stringify(token2tenant))
                    })
                }*/
            },
            goUserInfo () {
                this.$router.push('/content/user-info')
            },
            /**
             * @description 帮助中心
             */
            toHelpCenter () {
                this.$router.push('/content/helpCenter')
            },
            toManualLibraryCenter () {
                this.$router.push('/content/manualLibraryCenter')
            },
            /**
             * @description 服务申请
             */
            applyService () {
                // UCMP3-3297【站内消息】从ucmp平台进入站内消息页面后，点击右上角服务目录icon，无响应
                let currentUrl = sessionStorage.getItem('portal-router-path')
                if (!currentUrl.startsWith('/content/product/ucmp')) {
                    this.handleSelect('ucmp')

                    // 等DOM渲染Product组件
                    this.$nextTick(() => {
                        // 等待iframe loaded
                        document.getElementById('portal-content-frame').onload = () => {
                            window.frames[0].postMessage({isApplyService: true}, '*')
                        }
                    })
                } else {
                    // 等DOM渲染Product组件
                    this.$nextTick(() => {
                        window.frames[0].postMessage({isApplyService: true}, '*')
                    })
                }
            },

            goTicket () {
                // UCMP3-3297【站内消息】从ucmp平台进入站内消息页面后，点击右上角服务目录icon，无响应
                let currentUrl = sessionStorage.getItem('portal-router-path')
                if (!currentUrl.startsWith('/content/product/ucmp')) {
                    this.handleSelect('ucmp')

                    // 等DOM渲染Product组件
                    this.$nextTick(() => {
                        // 等待iframe loaded
                        document.getElementById('portal-content-frame').onload = () => {
                            window.frames[0].postMessage({isTicket: true}, '*')
                        }
                    })
                } else {
                    // 等DOM渲染Product组件
                    this.$nextTick(() => {
                        window.frames[0].postMessage({isTicket: true}, '*')
                    })
                }
            },
            /**
             * @description 是否包含服务目录菜单
             */
            isIncludeAppylyServiceUrl () {
                let ucmpMenus = this.customMenus.find(item => item.appUrl === 'ucmp')
                if (!ucmpMenus) {
                    return false
                }

                return ucmpMenus.subMenu.some(subItem => {
                    return subItem.menus.find(menuItem => menuItem.menuUrl === 'ucmp_catalog')
                })
            },

            isIncludeTicketUrl () {
                let ucmpMenus = this.customMenus.find(item => item.appUrl === 'ucmp')
                if (!ucmpMenus) {
                    return false
                }

                return ucmpMenus.subMenu.some(subItem => {
                    return subItem.menus.find(menuItem => menuItem.menuUrl === 'tickets')
                })
            },
            // 获取用户来源
            getDomainList () {
                UserApi.getDomainList().then(res => {
                    this.domains = res.domains.map(item => {
                        return {
                            id: item.id,
                            name: item.id === 'default' ? '本地' : item.name
                        }
                    })
                })
            },
            // 根据用户来源获取租户列表
            getTenantListByDomainId () {
                this.activeUser = ''
                TenantApi.getTenantListByDomainId(this.activeDomain).then(res => {
                    this.userList = res
                })
            },
            // 关闭切换用户来源弹框
            handleUserResourceClose () {
                this.activeUser = ''
                this.activeDomain = ''
                this.switchUserResourceDialog = false
            },
            // 切换用户来源 提交
            handleSwitchUserResource () {
                let body = {
                    domain_id: this.activeDomain,
                    user_id: localStorage.getItem('userId'),
                    project_id: this.activeUser
                }
                UserApi.switchUserResource(body).then(res => {
                    if (res.state === 0) {
                        this.$router.push('/login')
                        return false
                    } else if (res.state === 1) {
                        // UCMP3-5755 用户切换来源后（从A域切换到B域），在B域下，不显示租户名称，用户信息也不正确
                        localStorage.setItem('tenant', this.activeUser)
                        localStorage.setItem('domainId', this.activeDomain)
                        localStorage.setItem('userId', res.user_id)
                        let currentTenant = this.userList.find(item => item.id === this.activeUser)
                        this.setCurrentTenantName(currentTenant ? currentTenant.name : '')
                        this.reload()
                        this.handleUserResourceClose()
                        this.$notify({
                            type: 'success',
                            message: '切换成功'
                        })
                    }
                })
            },
            ...mapActions([
                'setSystemInfo',
                'setSystemApp',
                'setCustomMenus',
                'setTenantList',
                'setCurrentTenantName',
                'setLicenseInterval',
                'clearLicenseInterval'
            ])
        },
        computed: {
            /**
             * @description 功能中心菜单显示名称
             */
            functionMenuItemName () {
                let index = this.productMenuItemProps.indexOf(this.activeIndex)
                if (index !== -1) {
                    return this.customMenuList[index].appName
                }
                return this.defaultFunctionMenuName
            },
            /**
             * @description 当前激活的菜单项是否产品
             */
            ifProduct () {
                if (!this.activeIndex) {
                    return false
                }
                if (this.activeIndex === 'atomflow') {
                    if (sessionStorage.getItem('atomflow-router-path')) {
                        sessionStorage.removeItem('atomflow-router-path')
                    }
                } else if (this.activeIndex === 'cmdb') {
                    if (sessionStorage.getItem('cmdb-router-path')) {
                        sessionStorage.removeItem('cmdb-router-path')
                    }
                }
                // UCMP3-2264 支持其他平台的服务嵌套显示
                return this.apps.map(app => {
                    return app.module_url
                }).indexOf(this.activeIndex) !== -1 && this.activeIndex !== 'system'
            },
            productMenuItemProps () {
                return this.customMenuList.map(
                    item => {
                        return item.appUrl
                    }
                )
            },
            isShowApplyService () {
                return this.activeIndex === 'ucmp' && this.isIncludeAppylyServiceUrl()
            },
            isShowTicket () {
                return this.activeIndex === 'ucmp' && this.isIncludeTicketUrl()
            },

            tenantAvailableList () {
                return this.tenantList.filter(item => item.enabled && item.id !== this.currentTenantId)
            },
            ...mapGetters([
                'system',
                'topNavBarDisplay',
                'customMenus',
                'tenantList',
                'currentTenantName',
                'checkoutProject'
            ])
        },
        watch: {
            // 同步更改页签名称
            'system.sys_name': {
                handler (newVal, oldVal) {
                    document.title = newVal
                },
                immediate: true
            }
        },
        created () {
            this.user.name = localStorage.getItem('systemUserName')

            this.init()

            // 获取用户默认租户
            // UCMP-791 【AD同步】AD域用户同步至系统之后，角色分配无法选择租户。
            this.getTenantList()
            this.getDomainList()
        },
        components: {
            MessageBox,
            CustomDialog
        }
    }
</script>
<style lang="scss" scoped>
    .tools-box {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        .service-icon {
            margin-top: 6px;
            margin-right: 30px;
            font-size: 25px;
            color: $contentColor;
            cursor: pointer;
        }
        .message-box {
            margin-top: 6px;
            color: $contentColor;
            cursor: pointer;
            margin-right: 35px;
        }
        .user-config {
            color: $contentColor;
            display: inline-block;
            font-size: $fontSize;
            cursor: pointer;
            margin-right: 16px;

            & > div {
                height: 55px;
                line-height: 55px;
            }

            .user-avatar {
                top: 3px;
                height: 25px;
                width: 25px;
                display: inline-block;
                // border-radius: 50%;
                // border: 1px solid $contentColor;
                position: relative;
                margin-right: 6px;
            }
        }
    }
    .portal-icon-service:before {
         font-size: 27px;
    }
    .portal-icon-bangzhuzhongxin:before {
         font-size: 24px;
    }
    .portal-icon-manual-library:before {
        font-size: 28px;
    }
    .search-pane {
        position: absolute;
        top: 13px;
        right: 280px;
        background-color: #364150;
        border-radius: 16px;
        display: flex;
        .search {
            color: #a1aac8;
            border-color: #364150;
            background-color: #364150;
            border-radius: 16px;
            padding: 5px 12px 4px 12px;
            font-size: 20px;
        }
    }

    .portal-container-frame {
        width: 100%;
        height: calc(100% - 55px);
        & > iframe {
            border: 0;
            width: 100%;
            height: 100%;
        }
    }

    .portal-footer {
        display: none;
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 50px;
        line-height: 50px;
        background: #363d48;
        text-align: center;
        z-index: 20;
        .footer-content {
            margin: 0;
            font-size: 14px;
            color: #5d687c;
        }
    }

    .sys-menu {
        border-bottom: 0;
        height: 55px;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);
        li.el-menu-item.official {
            padding-left: 10px;
            img {
                max-width: 40px;
                height: 36px;
            }
            span {
                color: #fff;
                font-size: $fontSize;
                margin-left: 5px;
                font-weight: 600;
            }
            &:hover, &:active, &:focus {
                background-color: $menuBgColor;
            }
        }
    }

    .user-config__wrap {
        padding: 0 8px;
        font-size: $fontSize;
        color: $descColor;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .user-config__item {
        padding: 8px 0px 8px 8px;
        &.exit {
            border-bottom: 1px solid $borderColor;
        }
        .info-text {
            padding-left: 5px;
        }
        &:hover {
            cursor: pointer;
            i {
                color: $themeColor
            }
            .info-text {
                color: $themeColor
            }
        }
    }

    .drop-menu {
        background-color: $menuBgColor;
        padding-top: 25px;
        margin-top: -10px;
        .drop-menu-content {
            height: 275px;
            padding: 0px 5px 10px 5px;
            display: flex;
            .drop-menu-item {
                width: 225px;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                .title {
                    padding-left: 20px;
                    font-size: 16px;
                    color: #fff;
                    cursor: pointer;
                }
                .menu-pane {
                    margin-top: 25px;
                    height: 225px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                    padding-left: 20px;
                    border-left: 1px solid #354251;
                    .menu {
                        padding-bottom: 20px;
                        font-size: 14px;
                        color: #a1aac8;
                        cursor: pointer;
                    }
                }
            }
        }
        .drop-menu-footer {
            border-top: 1px solid #354251;
            height: 45px;
            padding-right: 40px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .custom-pane {
                cursor: pointer;
                .icon-button {
                    font-size: 20px;
                    margin-right: 10px;
                    color: #a1aac8;
                    cursor: pointer;
                }
                .custom {
                    color: #ffffff;
                }
            }
        }
    }
</style>
<style lang="scss">
    .content {
        position: relative;

        .search-pane > .inner-search-input {
            width: 500px;
            .el-input-group__prepend {
                border-radius: 16px 0 0 16px;
                border-color: #364150;
                background-color: #364150;
                font-size: 14px;

                .el-input {
                    width: 220px;
                }

                .el-input__inner {
                    padding-right: 0;
                    border-right: 1px solid #525963;
                }
            }
            & > .el-input__inner {
                background-color: #364150;
                border-color: #364150;
                font-size: 14px;
                color: #a1aac8;
            }
            .el-input-group__append {
                background-color: #364150;
                border-radius: 16px;
                padding: 6px 12px;
                font-size: 14px;
            }
        }
    }
</style>
