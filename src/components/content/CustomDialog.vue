<template lang="pug">
    el-dialog.custom-dialog(title="自定义快捷操作"  width="895px" :visible.sync="visible" :before-close="handleClose")
        div.dialog-content
            div.dialog-content-left
                div.app-list(v-for="(item, index) in menus" :key="index")
                    a.nav-link(javascript="void(0)" :class="{'active': activeAppIndex === item.appUrl}" @click="activeAppChange(item)") {{item.appName}}
            div.dialog-content-right
                div.menu-item(v-for="(item, index) in subMenus" :key="index")
                    div.title {{item.subTitle}}
                    div.menu-pane
                        div.menu(v-for="(menu, index) in item.menus")
                            el-checkbox(v-model="menu.checked") {{menu.title}}
        div.dialog-footer(slot="footer")
            el-button(@click="handleClose()") 取消
            el-button(@click="submit" type="primary") 保存
</template>
<script>
    /**
     * @description 自定义快捷
     */
    import {mapActions, mapGetters} from 'vuex'

    export default {
        name: 'CustomDialog',
        props: ['visible', 'activeApp'],
        data () {
            return {
                activeAppIndex: '',
                subMenus: [],
                menus: []
            }
        },
        methods: {
            /**
             * @description 关闭对话框
             */
            handleClose () {
                this.$emit('closeDialog')
            },
            /**
             * @description 确定事件
             */
            submit () {
                this.setCustomMenus(this.menus)
                const systemUserName = localStorage.getItem('systemUserName')
                localStorage.setItem('customMenus_' + systemUserName, JSON.stringify(this.menus))
                this.$emit('closeDialog')
            },
            /**
             * @description app索引改变事件
             * @param [obj] 选中对象
             */
            activeAppChange (obj) {
                this.activeAppIndex = obj.appUrl
                this.subMenus = obj.subMenu
            },
            initMenus () {
                let customMenus = JSON.parse(JSON.stringify(this.customMenus))
                let index = customMenus.findIndex(item => item.appUrl === this.activeAppIndex)
                this.subMenus = customMenus[index].subMenu
                this.menus = customMenus
            },
            ...mapActions([
                'setCustomMenus'
            ])
        },
        created () {
            this.activeAppIndex = this.activeApp
            this.initMenus()
        },
        computed: {
            ...mapGetters([
                'customMenus'
            ])
        }
    }
</script>
<style lang="scss" scoped>
</style>
<style lang="scss">
    .custom-dialog {
        .el-dialog__body {
            padding: 0px !important;
        }

        .dialog-content {
            height: 550px;
            display: flex;
            .dialog-content-left {
                width: 220px;
                padding-top: 35px;
                background-color: #f6f6f6;
                .app-list {
                    font-size: 14px;
                    color: $descColor;
                    a {
                        cursor: pointer;
                        &:hover, &:active, &:focus {
                            background-color: #fff;
                        }
                    }
                    .active {
                        background-color: #fff;
                        color: $themeColor;
                        &:hover, &:active, &:focus {
                            color: $themeColor;
                        }
                    }
                }
            }
            .dialog-content-right {
                padding: 25px 35px;
                width: 675px;
                overflow-y: auto;
                .menu-item {
                    margin-bottom: 30px;
                    .title {
                        font-size: 16px;
                        color: #000;
                        padding-bottom: 18px;
                    }
                    .menu-pane {
                        display: flex;
                        flex-wrap: wrap;
                        .menu {
                            margin-right: 50px;
                        }
                    }
                }
            }
        }
    }
</style>


