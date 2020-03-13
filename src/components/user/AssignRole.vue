<template lang="pug">
    el-dialog.assign-role(:title="title" :visible.sync="assignVisible" :before-close="close")
        el-form(size="small" label-width="200px")
            el-form-item(v-if="platform && platform.visible" v-for="(platform, platformKey) in platformRoleMap" :label="appLabel[platformKey]" :key="platformKey")
                el-select(
                v-model="platform.selected"
                :disabled="platform.disabled"
                @blur="platformBlur"
                :class="{'is-danger': showDangerTip}"
                clearable)
                    el-option(v-for="option in platform.options" :key="option.id" :value="option.id" :label="option.name")
            el-form-item
                span.is-danger(v-show="showDangerTip") 至少选择一个角色
        div(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(@click="save" size="small" type="primary" :disabled="userName === currentUserName") 保存
</template>
<script>
    import RoleApi from '@api/axios.role'
    import axios from 'axios'
    import {mapGetters} from 'vuex'

    /**
     * 给单个用户分配角色
     * @description 每个应用系统最多分配一个
     */
    export default {
        props: ['userId', 'userName', 'assignVisible'],
        data () {
            return {
                formUpdate: false,
                platformRoleMap: {},
                currentUserName: localStorage.getItem('systemUserName'),
                projectId: localStorage.getItem('tenant')
            }
        },
        methods: {
            close () {
                this.$emit('closeDialog')
            },
            save () {
                this.platformBlur()
                if (!this.selectedRoles.length) return

                let payload = {
                    user_id: this.userId,
                    role_id: this.selectedRoles
                }

                RoleApi.assignRolesForUser(payload).then(res => {
                    this.$notify({
                        title: '通知',
                        type: 'success',
                        message: `${this.title}成功!`
                    })

                    this.$emit('updateRole')
                    this.close()
                })
            },
            initUserRole () {
                axios.all([RoleApi.getAllowRoleList(this.projectId), RoleApi.getRoleDetailByUser(this.userId)]).then(
                    axios.spread((roleList, userRole) => {
                        this.initRoleListByOperator(roleList)
                        this.initUserRoleList(userRole)
                    })
                )
            },
            initRoleListByOperator (roleListRes) {
                // apps在接口返回的时候是存在顺序的
                let platformRoleMap = {}

                // 当前操作人可以在分配时看到的 应用系统
                this.apps.filter(item => item.prop !== 'appcenter').forEach(item => {
                    platformRoleMap[item.prop] = {
                        selected: null,
                        disabled: true,
                        visible: true,
                        options: []
                    }
                })

                roleListRes.roles.forEach(item => {
                    if (platformRoleMap[item.platform_name]) {
                        platformRoleMap[item.platform_name].disabled = false
                        platformRoleMap[item.platform_name].options.push(item)
                    }
                })

                // 当前操作人可以在分配时看到的 应用系统及其权限
                this.platformRoleMap = platformRoleMap
            },
            initUserRoleList (userRole) {
                for (let [app, roleData] of Object.entries(userRole)) {
                    // 用户有权限操作的
                    if (this.platformRoleMap[app]) {
                        // 被操作人权限大于等于操作人，平台不可操作且需添加一条展示条目
                        if (!this.checkedModuleAuthority(app, roleData.id)) {
                            this.platformRoleMap[app].options.push({
                                id: roleData.id,
                                name: roleData.name
                            })

                            this.platformRoleMap[app].disabled = true
                        }
                        this.platformRoleMap[app].selected = roleData.id
                    } else {
                        // 用户没有权限操作的，保留下选中值
                        this.platformRoleMap[app] = {
                            selected: roleData.id,
                            disabled: true,
                            visible: false,
                            options: []
                        }
                    }
                }
            },
            // 表示表单操作过了
            platformBlur () {
                this.formUpdate = true
            },

            // 判断当前用户是否有权限修改选中用户某个平台的权限
            checkedModuleAuthority (platform, selectedId) {
                let authority = this.platformRoleMap[platform].options.find(item => item.id === selectedId)
                return !!authority
            }
        },

        computed: {
            title () {
                return `用户【${this.userName}】分配角色`
            },
            // 所有选中的角色
            selectedRoles () {
                let arr = []
                for (let platform of Object.values(this.platformRoleMap)) {
                    if (platform && platform.selected) arr.push(platform.selected)
                }

                return arr
            },

            showDangerTip () {
                return this.formUpdate && !this.selectedRoles.length
            },

            // 应用系统的k-v值
            appLabel () {
                let labelObj = {}
                this.apps.forEach(app => {
                    labelObj[app.prop] = app.label
                })

                return labelObj
            },

            ...mapGetters([
                'apps'
            ])
        },

        created () {
            this.initUserRole()
        }
    }
</script>
<style lang="scss" scoped>
    .is-danger {
        color: $dangerColor;
        border-color: $dangerColor;
    }

    span.is-danger {
        font-size: 14px;
    }
</style>
<style lang="scss">
    .assign-role {
        .is-danger {
            input {
                border-color: $dangerColor;
            }
        }
    }
</style>
