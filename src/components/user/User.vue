<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 用户管理
        div
            el-button.breadcrumb-btn(v-btn-privilege="'user_create'" v-if="domainId === 'default'" @click="addUser" type="primary" icon="el-icon-plus" size="small") 创建用户
            el-button.breadcrumb-btn(v-btn-privilege="'user_sync'" v-if="domainId !== 'default'" @click="syncUser" type="primary" size="small" plain) 同步用户

        div.portal-content.with-search
            el-row.query-row(:class="{'query-use-ad-row': useAD}")
                label.search-label 登录名/姓名
                el-input.smallWidth(placeholder="请输入登录名/姓名" size="small" v-model="searchName" clearable)

                label.search-label 所属组织机构
                SearchInputOrganization.smallWidth(v-model="searchOrg")

                label.search-label 产品模块
                el-select.smallWidth(size="small", v-model="activeModule", @change="getRoles", clearable)
                    el-option(v-for="module in modules", :value="module.module_url", :label="module.module_name", :key="module.id")
                    
                label.search-label 角色名称
                el-select.smallWidth(size="small", v-model="activeRole", :disabled="!activeModule", clearable, :placeholder="activeModule ? '请选择' : '请先选择产品模块'")
                    el-option(v-for="role in roles", :value="role.role_id", :label="role.name", :key="role.role_id")

                el-button(type="primary" size="small" @click="queryByKeyword") 查询
            el-button.join-ad-button(v-if="useAD" :disabled='!selectedUsers.length' type="primary" size="small" @click="joinAD") 写入AD
            el-table(:data="tableData" :style="{width: tableWidth, height: tableHeight}" size="small" stripe v-loading="loadingTable" element-loading-spinner="ucmp-icon-loading" @selection-change="handleSelectionChange")
                el-table-column(v-if="useAD" type="selection" width="45")
                el-table-column(v-for="column in columns" :key="column.prop" :type="column.type" :prop="column.prop" :label="column.label" :width="column.width" :fixed="column.fixed")
                    template(slot="header" slot-scope="scope") 
                        span(v-if="column.prop !== 'set_tag'") {{ column.label }}
                        el-tooltip(v-else effect="light" content="需要AD管理员在AD后台设置用户密码，是代表已设置，否代表未设置" placement="top-start")
                            span.theme-color {{ column.label }}
                    template(slot-scope="scope")
                        el-button(type="text" size="small" v-if="column.link" @click="toViewUserDetail(scope.row)") {{scope.row[column.prop]}}
                        el-tooltip(v-else-if="column.prop === 'status'" content="禁用用户将无法登录" :disabled="scope.row.enabled === 1")
                            el-button(@click="changeStatus(scope.row)" size="mini" :type="scope.row.enabled ? 'success' : 'danger'" :disabled="disableName === scope.row.name") {{scope.row.enabled ? '启用' : '禁用'}}
                        span(v-else-if="column.prop === 'set_tag'") {{ scope.row[column.prop] === null ? '' : (scope.row[column.prop] ? '是' : '否')}}
                        span(v-else) {{scope.row[column.prop]}}
                el-table-column(prop="opration" label="操作" width="130px")
                    template(slot-scope="scope")
                        icon-button(v-btn-privilege="operation.key" v-for="operation in operations" :key="operation.id" :type="operation.type" @iconClick="operationHandler" :args="{id: operation.prop, row: scope.row}" :text="operation.label" v-if="isShowBtn(scope.row, operation.prop)")
                        icon-button(v-btn-privilege="'user_delete'" v-if="domainId === 'default' && disableName !== scope.row.name && !scope.row.init_user" :type="'el-icon-delete'" @iconClick="operationHandler" :args="{id: 'delete', row: scope.row}" :text="'删除'")
            div.pagination-row
                el-pagination(
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="pagination.index"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.size"
                layout="sizes, total, prev, pager, next"
                :page-count="pagination.count"
                :total="pagination.total")
        AssignRole(v-if="assignVisible" :userId="assignUserId" :userName="assignUserName" :assignVisible="assignVisible" @closeDialog="assignVisible = false" @updateRole="getUserList")
        EditUserDialog(v-if="editUserVisible" :visible="editUserVisible" :userId="userId" @closeDialog="closeDialog" @updateUser="updateUser")
</template>
<script>
    import userColumns, { AD_COLUMNS } from '@mock/user/userColumns'
    import UserApi from '@api/axios.users'
    import OrgApi from '@api/axios.organization'
    import IconButton from '@/components/lib/IconButton'
    import EditUserDialog from './EditUserDialog'
    import AssignRole from './AssignRole'
    import SearchInputOrganization from '@lib/SearchInputOrganization'
    import { ResizeSensor } from 'css-element-queries'
    import {initWebSocket} from '@leaptocloud/standard-ui'

    export default {
        data () {
            return {
                searchName: '',
                searchOrg: '',
                tableData: [],
                originTableData: [],
                domainId: '',
                userName: '',
                userId: '',
                editUserVisible: false,
                disableName: localStorage.getItem('systemUserName'),
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                loadingTable: false,
                user_role: null,
                allRoles: [],
                assignVisible: false,
                assignUserId: '',
                assignUserName: '',
                base_dn: '', // 自动同步的base_dn, 不用每次都输入
                activeModule: '',
                modules: [],
                roles: [], //角色列表
                activeRole: '', // 选中的角色
                useAD: false,
                selectedUsers: [],
                tableWidth: '100%',
                tableHeight: '100%',
                resizeSensor: null,
                subscribeInstance: null // webSocket订阅对象实例，用来取消订阅
            }
        },
        methods: {
            // 若'init_user'=True，该用户为初始化超级管理员，应该隐藏修改和删除按钮
            isShowBtn (rowObj, prop) {
                if (rowObj.init_user === true) {
                    return prop !== 'edit'
                }
                return true
            },
            /**
             * @description 表格切换每页展示
             */
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getUserList()
            },
            /**
             * @description 表格切换页
             */
            handleCurrentChange () {
                this.getUserList()
            },
            addUser () {
                this.$router.push('user/add')
            },
            /**
             * @description 表格操作
             */
            operationHandler (obj) {
                if (obj.id === 'edit') {
                    this.userId = obj.row.id
                    this.editUserVisible = true
                    return
                }

                if (obj.id === 'assign') {
                    this.assignUserId = obj.row.id
                    this.assignUserName = obj.row.name
                    this.assignVisible = true
                    return
                }

                if (obj.id === 'reset') {
                    this.$confirm('用户【' + obj.row.name + '】的密码将被重置为 123456, 是否继续', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        /*
                         *  原子作业平台ATOMFLOWAT-251 重置密码之后，点击编辑用户，用户信息显示不出来
                         *  问题原因：传参字段缺失
                         *  解决方法：将用户信息和密码一起作为参数传给接口
                         */
                        let payload = {
                            domain_id: this.domainId,
                            id: obj.row.id
                        }
                        UserApi.resetUserPassword(payload).then(res => {
                            this.$notify({
                                type: 'success',
                                message: '用户【' + obj.row.name + '】重置密码成功'
                            })
                        })
                    }).catch(() => {
                    })
                    return
                }

                /*
                 * 原子作业平台ATOMFLOWAT-154
                 * 问题原因：删除用户功能缺失
                 * 解决方法：添加删除功能
                 * 回归版本：v0.1
                 */
                if (obj.id === 'delete') {
                    this.$confirm('确定要删除该用户吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        UserApi.deleteUser(obj.row.id).then(res => {
                            this.$notify({
                                type: 'success',
                                message: '用户' + obj.row.name + '删除成功'
                            })
                            this.getUserList()
                        })
                    }).catch(() => {
                    })
                }
            },
            /**
             * @description 启用或者禁止用户
             */
            changeStatus (obj) {
                /*
                 * 原子作业平台ATOMFLOWAT-125
                 * 问题原因：按钮会让用户误以为可以点击
                 * 解决方法：将操作中的启用和禁止放到此处
                 * 回归版本：v0.1
                 */
                let status = obj.enabled ? '禁用' : '启用'
                this.$confirm('用户 ' + obj.name + ' 的密码将被' + status + ', 是否继续', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let payload = JSON.parse(JSON.stringify(obj))

                    payload.enabled = Number(!payload.enabled)
                    UserApi.updateUser(payload).then(res => {
                        this.$notify({
                            type: 'success',
                            message: '用户' + obj.name + status + '成功'
                        })

                        obj.enabled = Number(!obj.enabled)
                    })
                }).catch(() => {
                })
            },
            closeDialog () {
                this.editUserVisible = false
            },
            updateUser () {
                this.getUserList()
                this.editUserVisible = false
            },
            toViewUserDetail (obj) {
                this.$router.push({
                    path: 'user/' + obj.id,
                    query: {name: obj.name, init_user: obj.init_user}
                })
            },
            /**
             * @description 模糊搜索用户名称
             */
            queryByKeyword () {
                /*
                * 原子作业平台ATOMFLOWAT-152
                * 问题原因：功能缺失
                */
                this.pagination.index = 1
                this.getUserList()
            },
            getUserList () {
                this.loadingTable = true
                this.domainId = localStorage.getItem('domainId')
                const params = {
                    limit: this.pagination.size,
                    page_idx: this.pagination.index,
                    name: this.searchName,
                    org_id: this.searchOrg ? this.searchOrg.org_id : '',
                    role_id: this.activeRole ? this.activeRole : ''
                }

                // 后台分页，搜索
                UserApi.getUserListWithPagination(params).then(res => {
                    this.tableData = res.users
                    this.pagination.count = res.page_count || 1
                    this.pagination.total = res.total || 0
                    this.loadingTable = false
                }, () => {
                    this.loadingTable = false
                })
            },
            // 获取模块列表
            getModules () {
                UserApi.getModules().then(res => {
                    this.modules = res
                })
            },
            // 获取角色列表
            getRoles () {
                this.activeRole = ''
                UserApi.getRolesByModuleId(this.activeModule).then(res => {
                    this.roles = res
                })
            },
            /**
             * @description 同步用户
             */
            syncUser () {
                this.$prompt('点击确认按钮后，开始同步用户，同步用户需要一定的时间，请耐心等待，不要反复进行操作！', '填写同步参数', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^.+$/,
                    inputErrorMessage: '同步参数不能为空',
                    inputPlaceholder: 'OU=研发中心,DC=example,DC=com',
                    inputValue: this.base_dn
                }).then(({value}) => {
                    const payload = {base_dn: value}
                    UserApi.syncADUser(payload).then(res => {
                        // # sync_status 0 同步失败 # sync_status 1 同步成功 # sync_status 2 同步中
                        // # sync_status 3 组织机构同步中 # sync_status 4 组织机构同步失败 # sync_status 5 没有同步过组织机构，需要先同步组织机构

                        // let msgs = ['用户同步失败', '用户同步成功', '用户同步中', '组织机构同步中', '组织机构同步失败', '没有同步过组织机构，需要先同步组织机构']
                        let message = res.sync_status || ''
                        this.$notify({
                            type: 'success',
                            message
                        })

                        this.getUserList()
                        // UCMP3-5665 同步用户、同步组织机构输入框需要记录用户上一次手动输入的数据，而不是自动同步时填写的basedn
                        this.getBaseDn()
                        this.subscribe()
                    })
                }).catch(() => {
                })
            },
            //websocket订阅当前服务的状态
            subscribe () {
                if (!window.websocketClient) { window.websocketClient = initWebSocket({token: localStorage.getItem('authenticationToken'), disableDebug: process.env.NODE_ENV === 'development'}) }
                
                // websocket 观察对象函数
                const subscribeEvent = () => {
                    return window.websocketClient.subscribe('/user/queue/guardian.sync.user', d => {
                        if (d && d.body && d.body === 'Users sync finished.') { 
                            this.$notify({
                                type: 'success',
                                message: '用户同步已完成'
                            })
                            this.getUserList()
                            this.unsubscribe()
                        }
                    })
                }
                window.websocketClient.onConnect = () => {
                    // UCMP3-5805 特殊场景需要重新连接时，能主动观察当前服务的状态
                    this.subscribeInstance = subscribeEvent()
                }
                // UCMP3-5805 如果当前是连接状态，直接观察
                if (window.websocketClient.connected) { this.subscribeInstance = subscribeEvent() }
            },

            // UCMP3-5804 websocket取消订阅事件
            unsubscribe () {
                if (this.subscribeInstance && this.subscribeInstance.unsubscribe) { this.subscribeInstance.unsubscribe() }
            },

             /**
             * @description 获取组织同步机构的信息
             */
            getBaseDn () {
                OrgApi.getBaseDn('user').then(res => {
                    this.base_dn = res.base_dn
                })
            },

            // UCMP3-6286 复选框选择事件
            handleSelectionChange (val) {
                this.selectedUsers = val
            },

            // UCMP3-6286 批量写入AD
            joinAD () {
                let payload = {
                    user_tag: 1,
                    user_ids: this.selectedUsers.map(user => user.id)
                }
                UserApi.setUserADTag(payload).then(
                    res => {
                        this.$notify({
                            type: 'success',
                            message: '选中的用户标记AD成功'
                        })
                        this.getUserList()
                        this.selectedUsers.splice(0, this.selectedUsers.length)
                    }
                )
            }
        },
        created () {
            this.getModules()
            this.getUserList()
            this.getBaseDn()
            // UCMP3-6286 是否使用AD
            if (this.domainId === 'default') { // UCMP3-6500 本地域用户登录该标志置为 false
                this.useAD = false
            } else {
                UserApi.ifUseAd().then(res => {
                    this.useAD = res.tag
                })
            }
        },
        mounted () {
            const ele = this.$el.querySelector('.query-row')
            // UCMP3-6504 观察筛选栏的高度变化，适时改变表格高度
            this.resizeSensor = new ResizeSensor(ele, () => {
                    const height = ele.offsetHeight
                    this.tableHeight = 'calc(100% - 48px - ' + height + 'px - 16px)' // UCMP3-6504 48px 为面包屑高度 + padding-top（最后的16px为筛选栏的padding-top）
            })
        },
        destroyed () {
            // UCMP3-6504 消除对指定div的监测事件
            this.resizeSensor.detach(this.$el.querySelector('.query-row'))
            this.unsubscribe()
        },
        computed: {
            columns () {
                //如果是非default域登录不显示状态和手机号码
                let columns = this.domainId === 'default' ? userColumns : userColumns.filter((item, index) => {
                    return item.prop !== 'status' && item.prop !== 'phone'
                })

                columns = JSON.parse(JSON.stringify(columns))
                if (this.useAD) columns.splice(2, 0, AD_COLUMNS[0], AD_COLUMNS[1])
                return columns
            },
            operations () {
                if (this.domainId === 'default') {
                    return [
                        {type: 'el-icon-edit', label: '修改', prop: 'edit', key: 'user_modify'},
                        {
                            type: 'portal-icon-reset-password',
                            label: '重置密码',
                            prop: 'reset',
                            key: 'user_resetpwd'
                        },
                        {
                            type: 'portal-icon-role',
                            label: '分配角色',
                            prop: 'assign',
                            key: 'user_renew_role'
                        }
                    ]
                } else {
                    return [
                        {
                            type: 'portal-icon-role',
                            label: '分配角色',
                            prop: 'assign',
                            key: 'user_renew_role'
                        }
                    ]
                }
            }
        },
        components: {
            IconButton,
            EditUserDialog,
            AssignRole,
            SearchInputOrganization
        }
    }
</script>
<style lang="scss" scoped>
.join-ad-button {
    position: absolute;
    right: 16px;
    top: 16px;
}
.query-row {
    width: 100%;
    &.query-use-ad-row {
        width: calc(100% - 85px);
    }
}
.portal-content {
    position: relative;
}
</style>
