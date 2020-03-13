<template lang="pug">
    div.message-strategy.full-content
        div.full-content(v-if="!isAdd")
            el-row
                el-button.float-right(v-btn-privilege="'msg_strategy_add'" type="text" size="small" icon="el-icon-plus" @click="isAdd = true; isEdit = false") 添加策略
            el-table(:data="strategysList" size="small" v-loading="loadingTable" element-loading-spinner="ucmp-icon-loading")
                el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" show-overflow-tooltip)
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'is_on'")
                            el-switch(v-model="scope.row[column.prop]" :active-value="1" :inactive-value="0" @change="changeUsedStatus(scope.row, column.prop)")
                        span(v-else-if="column.prop === 'operation'")
                            icon-button(v-btn-privilege="'msg_strategy_modify'" @iconClick="editStrategy(scope.row)" :type="'portal-icon-edit'" :text="'修改'" :args="{id: 'edit', row: scope.row}")
                            icon-button(v-btn-privilege="'msg_strategy_delete'" @iconClick="deleteStrategy(scope.row)" :type="'portal-icon-delete'" :text="'删除'" :args="{id: 'delete', row: scope.row}")
                        span(v-else-if="column.prop === 'support_message_type_names'") {{getModelName(scope.row[column.prop])}}
                        span(v-else-if="column.prop === 'accept_role_list'") {{getRoleLabel(scope.row[column.prop])}}
                            br
                            el-button(v-if="scope.row.accept_user_list.length" size="mini" type="text" @click="showMoreUser(scope.row.accept_user_list)") (更多接收人)
                        span(v-else-if="column.prop === 'update_at'") {{scope.row[column.prop] | formatDate }}
                        span(v-else) {{scope.row[column.prop]}}
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
            el-dialog(:visible.sync="usersDialogVisible" title="接收人列表")
                div
                    el-table(:data="userList" size="small")
                        el-table-column(prop="name" label="登录名")
                        el-table-column(prop="realname" label="真实姓名")
                        el-table-column(prop="org_name" label="组织机构")
                    el-row.pagination-row
                        el-pagination(
                        background
                        @size-change="handleUserSizeChange"
                        @current-change="handleUserCurrentChange"
                        :current-page.sync="paginationItem.index"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="paginationItem.size"
                        layout="sizes, total, prev, pager, next"
                        :page-count="paginationItem.count"
                        :total="paginationItem.total")
                span(slot="footer")
                    el-button(size="small" type="primary" @click="usersDialogVisible = false") 关闭
        AddMessageStrategy(v-else @changeState="changeState" :is-edit="isEdit" :strategy-obj="strategyObj")
</template>
<script>
    /**
     * @description 消息中心 ==> 消息策略
     */
    import MessageCenterApi from '@api/axios.messageCenter'
    import UserApi from '@api/axios.users'
    import IconButton from '@lib/IconButton'
    import Utils from '@server/utils'
    import AddMessageStrategy from './AddStrategy'
    
    export default {
        data () {
            return {
                isAdd: false,
                isEdit: false,
                loadingTable: false,
                columns: [
                    {prop: 'title', label: '策略名称'},
                    {prop: 'strategy_app_name', label: '配置对象'},
                    {prop: 'accept_role_list', label: '接收人'},
                    {prop: 'is_on', label: '是否启用'},
                    {prop: 'update_at', label: '更新时间'},
                    {prop: 'strategy_period_type_name', label: '周期'},
                    {prop: 'support_message_type_names', label: '消息类型'},
                    {prop: 'operation', label: '操作'}
                ],
                strategysList: [],
                strategyObj: null,
                pagination: {
                    size: 10,
                    index: 1,
                    count: 1,
                    total: 0
                },
                usersDialogVisible: false,
                paginationItem: {
                    size: 10,
                    index: 1,
                    count: 1,
                    total: 0
                },
                userIdList: [],
                userList: []
            }
        },
        created () {
            this.refreshStrategyList(this.pagination)
        },
        methods: {
            changeState (val) {
                this.isAdd = val.is_add
                if (val.is_reload) {
                    this.refreshStrategyList(this.pagination)
                }
            },
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.refreshStrategyList(this.pagination)
            },
            handleCurrentChange (val) {
                this.pagination.index = val
                this.refreshStrategyList(this.pagination)
            },
            refreshStrategyList (pagination) {
                this.loadingTable = true
                MessageCenterApi.getMsgStrategyList(this.pagination).then(res => {
                    if (res) {
                        this.strategysList = res.strategy_list
                        this.pagination.count = res.page_count || 1
                        this.pagination.total = res.total || 0
                        this.loadingTable = false
                    }
                }, () => {
                    this.loadingTable = false
                })
            },
            // 编辑策略
            editStrategy (row) {
                this.isAdd = true
                this.isEdit = true
                this.strategyObj = row
            },
            // 删除策略
            deleteStrategy (row) {
                this.$confirm(`请确认是否要删除消息策略--${row.title}`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    /**
                     * 调用删除策略接口
                     */
                    MessageCenterApi.delSreategy({id: row.id}).then(res => {
                        this.refreshStrategyList(this.pagination)
                        this.$message.success('删除成功')
                    }).catch(() => {
                        this.$message.success('删除失败')
                    })
                }, () => {
                })
            },
            // 切换策略的启用状态
            changeUsedStatus (row, prop) {
                let msg = row[prop] ? `启用消息策略: ${row.title}, 是否继续?` : `禁用消息策略: ${row.title}, 是否继续?`
                this.$confirm(msg, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    /**
                     * 启用/禁用 策略规则
                     */
                    MessageCenterApi.handleSreategyStatus({
                        id: row.id,
                        is_on: row[prop]
                    }).then(res => {
                        this.refreshStrategyList(this.pagination)
                    }).catch(() => {
                        row[prop] = Math.abs(row[prop] - 1)
                    })
                }).catch(() => {
                    row[prop] = Math.abs(row[prop] - 1)
                })
            },

            // 获取角色label列表
            getRoleLabel (list = []) {
                // 接口 lable ?
                return list.map(item => item.lable).join(',')
            },

            // 显示更多高级配置中的用户信息
            showMoreUser (list) {
                this.userIdList = list
                this.usersDialogVisible = true
                this.getUserList()
            },

            getUserList () {
                let params = {
                    page_idx: this.paginationItem.index,
                    limit: this.paginationItem.size,
                    user_ids: this.userIdList.join(',')
                }
                UserApi.getUserListWithPagination(params).then(res => {
                    this.userList = res.users // userList赋值是为了初始化显示

                    this.paginationItem.total = res.total
                    this.paginationItem.count = res.page_count
                })
            },

            // 获取模板label列表
            getModelName (list = []) {
                return list.join(',')
            },

            handleUserSizeChange (val) {
                this.paginationItem.size = val
                this.paginationItem.index = 1
                this.getUserList()
            },
            handleUserCurrentChange (val) {
                this.paginationItem.index = val
                this.getUserList()
            }
        },
        computed: {
        },
        components: {
            AddMessageStrategy,
            IconButton
        },
        filters: {
            formatDate (timestamp) {
                if (timestamp.toString().length === 10) {
                    timestamp *= 1000
                }
                return Utils.formatDate(new Date(timestamp))
            }
        }
    }
</script>
<style lang="scss" scoped>
    .el-table {
        height: calc(100% - 48px - 38px) !important;
    }
</style>

