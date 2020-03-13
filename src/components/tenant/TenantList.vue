<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 租户管理
        el-button.breadcrumb-btn(v-btn-privilege="'project_add'" v-if="canAddTenant" @click="addTenant" type="primary" size="small" icon="el-icon-plus") 增加租户
        div.portal-content
            el-table(:data="tableData" size="small" stripe)
                el-table-column(v-for="column in columns" :key="column.prop" :type="column.type" :prop="column.prop" :label="column.label" :width="column.width" :fixed="column.fixed")
                    template(slot-scope="scope")
                        el-tooltip(v-if="column.prop === 'status'" content="禁用租户将无法登录")
                            el-button(@click="changeStatus(scope.row)" size="mini" :type="scope.row.enabled ? 'success' : 'danger'" :disabled="scope.row.name === 'admin' || scope.row.id === currentUserTenant") {{scope.row.enabled ? '启用' : '禁用'}}
                        span(v-else) {{scope.row[column.prop]}}
                el-table-column(label="操作" width="120")
                    template(slot-scope="scope")
                        // 用户不能修改自己的当前租户名称
                        Icon-Button(v-btn-privilege="operation.key" v-for="operation in operations" v-if="scope.row.id !== currentUserTenant" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
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
        EditTenant(v-if="dialogVisible" :tenant="dialogData" :visible="dialogVisible" :isEdit="isEditType" @closeDialog="closeDialog" @updateTenant="updateTenant")

</template>

<script>
    /**
     * @description 租户列表
     */
    import IconButton from '@lib/IconButton'
    import EditTenant from './EditTenant'
    import TenantApi from '@api/axios.tenant'
    import RoleApi from '@api/axios.role'
    import {mapActions, mapGetters} from 'vuex'

    export default {
        name: 'TenantList',
        components: {IconButton, EditTenant},
        data () {
            return {
                columns: [
                    {prop: 'name', label: '租户名称'},
                    {prop: 'description', label: '描述'},
                    {prop: 'status', label: '状态'}
                ],
                dialogVisible: false,
                isEditType: false,
                dialogData: {},
                tableData: [],
                operations: [
                    {
                        prop: 'edit',
                        label: '修改',
                        type: 'portal-icon-edit',
                        key: 'project_edit'
                    }
                ],
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                currentRoles: []
            }
        },
        computed: {
            currentUserTenant () {
                return localStorage.getItem('tenant')
            },
            canAddTenant () {
                // admin租户才可增加租户
                return this.currentTenantName === 'admin'
            },
            ...mapGetters([
                'tenantList',
                'currentTenantName'
            ])
        },
        methods: {
            /**
             * @description 表格切换每页展示
             */
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getComputedList()
            },
            /**
             * @description 表格切换页
             */
            handleCurrentChange () {
                this.getComputedList()
            },
            addTenant () {
                this.dialogVisible = true
                this.dialogData = {}
                this.isEditType = false
            },
            /**
             * @表格操作
             * @param obj 操作类型operations，及选中行数据
             */
            handleOperation (obj) {
                //修改操作
                if (obj.id === 'edit') {
                    this.dialogVisible = true
                    this.dialogData = obj.row
                    this.isEditType = true
                }
            },
            closeDialog () {
                this.dialogVisible = false
            },
            /**
             * @description 增加及修改后的回调函数
             */
            updateTenant () {
                this.closeDialog()
                this.getTenantList()
            },
            /**
             * @description 获取租户列表
             */
            getTenantList () {
                this.pagination.index = 1
                TenantApi.getTenantList().then(res => {
                    this.setTenantList(res)
                    this.getComputedList()
                })
            },
            getComputedList () {
                let filteredData = this.tenantList

                // 分页计算
                let index = this.pagination.index
                let size = this.pagination.size
                let start = (index - 1) * size
                let end = Math.min((index) * size, filteredData.length)
                let pageCount = Math.ceil(filteredData.length / this.pagination.size)
                let pageData = filteredData.slice(start, end)

                this.tableData = pageData
                this.pagination.count = pageCount || 1
                this.pagination.total = filteredData.length
            },
            /**
             * @description 切换租户状态
             * @param row 行数据
             */
            changeStatus (row) {
                let status = row.enabled ? '禁用' : '启用'
                this.$confirm('租户【' + row.name + '】将被' + status + ', 是否继续', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // row.enabled = !row.enabled
                    TenantApi.updateTenant({
                        project_id: row.id,
                        name: row.name,
                        description: row.description,
                        enabled: !row.enabled
                    }).then(res => {
                        this.$notify({
                            type: 'success',
                            message: '租户【' + row.name + status + '】成功!'
                        })

                        this.getTenantList()
                    })
                }).catch(() => {
                })
            },
            getUserRoles () {
                RoleApi.getRoleDetailByUser(localStorage.getItem('userId')).then(res => {
                    // TODO
                    let roles = []
                    for (let app of Object.values(res)) {
                        roles.push(app.role_data)
                    }

                    this.currentRoles = roles
                })
            },
            ...mapActions([
                'setTenantList'
            ])
        },
        created () {
            this.getTenantList()
            this.getUserRoles()
        }
    }
</script>

<style lang="scss" scoped>
    .el-table {
        height: calc(100% - 48px);
    }
</style>