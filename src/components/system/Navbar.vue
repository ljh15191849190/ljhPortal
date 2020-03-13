<template lang="pug">
    el-menu.atom-navbar.menu-list(:default-active="activeIndex"
    router
    unique-opened
    class="system-navbar"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse"
    :collapse-transition="hasAnimation")
        |
        el-menu-item.dashboard-menu(v-for="item in showMenuList" :key="item.url" :index="item.url")
            i.portal-navbar-icon(:class="item.icon")
            span.portal-navbar-text(slot="title") {{item.title}}
</template>
<script>
    import Utils from '@server/utils'
    import MenuApi from '@api/axios.menu'
    import {mapGetters} from 'vuex'

    export default {
        props: ['isCollapse'],
        data () {
            return {
                menuList: [],
                activeIndex: '/content/system/user',
                hasAnimation: false
            }
        },
        computed: {
            showMenuList () {
                if (this.businessOrproject !== 'business') {
                    this.menuList.forEach(item => {
                        if (item.title === '业务管理') {
                            item.title = '项目管理'
                        }
                    })
                    return this.menuList
                } else {
                    return this.menuList
                }
            },
            ...mapGetters(['apps', 'businessOrproject'])
        },
        methods: {
            handleOpen () {

            },
            handleClose () {

            },
            getMenu (appId) {
                MenuApi.queryMenuByUser().then(res => {
                    this.menuList = res.filter(item => {
                        return item.sys_module_id === appId
                    })
                    let btnPermissionsStr = res.filter(item => {
                        return item.url === '/content/system/copyright-config' || item.url === '/content/system/sys-config' || item.url === '/content/system/message-center' || item.url === '/content/system/business' || item.url === '/content/system/role' || item.url === '/content/system/tenant' || item.url === '/content/system/organization' || item.url === '/content/system/user'
                    })
                    sessionStorage.setItem('btnPermissionsStr', JSON.stringify(btnPermissionsStr))
                    if (this.menuList.length) {
                        let storageRoute = sessionStorage.getItem('portal-router-path')
                        storageRoute = storageRoute.replace(/\?timestamp=[\d]*/g, '')

                        let reg = /^\/content\/system\/.+/g
                        let allUrls = this.menuList.map(item => item.url)
                        if (storageRoute && reg.test(storageRoute) && allUrls.indexOf(storageRoute) !== -1) {
                            this.$router.push(storageRoute + '?timestamp=' + new Date().getTime())
                            return
                        }
                        //如果没有默认的路由没在菜单中，取菜单的第一项路由
                        this.activeIndex = this.menuList[0].url
                        this.$router.push(this.activeIndex + '?timestamp=' + new Date().getTime())
                    } else {
                        Utils.goEmpty()
                    }
                })
            }
        },
        created () {
            // UCMP3-1892【系统管理】系统管理默认进来，没有高亮到用户管理导航栏
            this.activeIndex = this.$router.currentRoute.path
            let appId = ''
            if (process.env.NODE_ENV === 'production') {
                appId = sessionStorage.getItem('portal-app-id')
            } else {
                appId = this.apps.find(item => item.prop === 'system').id
            }

            this.getMenu(appId)
        },
        watch: {
            $route (to, from) {
                this.activeIndex = to.fullPath.replace(/\?timestamp=[\d]*/g, '')
            }
        }
    }
</script>
<style lang="scss" scoped>
    .portal-navbar-icon {
        vertical-align: middle;
        display: inline-block;
        width: 24px;
        font-size: 20px;
        margin-right: 5px;
    }
</style>
<style lang="scss">
    .el-menu.atom-navbar.menu-list {
        border: none;
        width: $menuLargeWidth;
        height: calc(100% - #{$menuHeight} - 1px);
        padding: 0px 0px $menuHeight;
        overflow-y: auto;
        background-color: $menuItemBgColor;
        &.el-menu--collapse {
            width: $menuSmallWidth;
            .el-submenu > .el-submenu__title, .dashboard-menu > .el-tooltip {
                padding: 0;
                padding-left: 16px !important;
            }
        }
        .el-menu-item, .el-submenu__title {
            background: $menuItemBgColor !important;
            line-height: $menuHeight;
            height: $menuHeight;
            .portal-navbar-text, i {
                color: $whiteColor;
            }
        }
        li {
            background: $menuItemBgColor;
            border-left: none !important;
            border-bottom: 1px solid $menuBgColor;
            .el-submenu__title {
                border-left: none !important;
            }
        }
        .el-menu-item:hover, .el-menu-item:active,
        .el-submenu__title:hover, .el-submenu__title:active {
            .portal-navbar-text, i {
                color: $whiteColor;
            }
        }
    }

    .el-menu.atom-navbar > .el-submenu.is-active > .el-submenu__title,
    .el-menu.atom-navbar.menu-list .el-menu-item.dashboard-menu.is-active {
        background-color: $themeColor !important;
        color: $whiteColor;
        .portal-navbar-text, i {
            color: $whiteColor;
        }
    }

    // 右边箭头
    .el-submenu.is-active, .el-menu-item.dashboard-menu.is-active {
        position: relative;
        &:after {
            content: "";
            position: absolute;
            right: 0;
            top: 12px;
            display: inline-block;
            border-width: 8px 10px;
            border-style: solid;
            border-color: transparent;
            border-right-color: #eef1f5;
        }
    }
</style>

