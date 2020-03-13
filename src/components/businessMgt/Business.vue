<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item {{`${IsBussiness}管理`}}

        el-button.breadcrumb-btn(v-btn-privilege="'business_create'" @click="addBusiness" type="primary" size="small" icon="el-icon-plus") {{`创建${IsBussiness}`}}

        div.portal-content.with-search
            el-row
                label.search-label {{`${IsBussiness}名称`}}
                el-input(size="small" clearable v-model="searchName" :placeholder="`请输入${IsBussiness}名称`")
                label.search-label 所属组织机构
                SearchInputOrganization(v-model="searchOrg")
                el-button(type="primary" @click="query" size="small") 查询
            el-table(:data="tableData" stripe :row-key="getRowKey" :expand-row-keys="expands")
                el-table-column(type="expand")
                    template(slot-scope="props")
                        el-card
                            SubAppList(:businessId="props.row.id" :orgTree="orgTree")

                el-table-column(v-for="column in columns" :key="column.prop" :type="column.type" :prop="column.prop" :label="column.label" :width="column.width" :fixed="column.fixed")
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'usernames'") {{scope.row[column.prop].join('，')}}
                        span(v-else-if="column.prop === 'org_name'") {{`${scope.row[column.prop]} ${scope.row.enable===0?'（该组织机构已删除）':''}`}}
                        span(v-else) {{scope.row[column.prop]}}
                el-table-column(label="操作" width="130")
                    template(slot-scope="scope")
                        Icon-Button(v-btn-privilege="operation.key" v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")

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
                
        EditBusiness(v-if="dialogVisible" :data="dialogData" :visible="dialogVisible" :isEdit="isEditType" @closeDialog="closeDialog" @update="update")
        BusinessUser(v-if="userVisible" type="bussiness" :data="userData" :visible="userVisible" @closeuserDialog="closeuserDialog" @updateUser="updateUser")
</template>

<script>
    /**
     * @desctiption 应用管理
     */
    import api from '@api/axios.business'
    import OrgApi from '@api/axios.organization'
    import IconButton from '@lib/IconButton'
    import EditBusiness from './EditBusiness'
    import SubAppList from './SubAppList'
    import BusinessUser from './BusinessUser'
    import SearchInputOrganization from '@lib/SearchInputOrganization'
    import {mapGetters} from 'vuex'
    export default {
        name: 'ApplicationMgt',
        components: {
            IconButton,
            EditBusiness,
            SubAppList,
            SearchInputOrganization,
            BusinessUser
        },
        data () {
            return {
                operations: [
                    {type: 'portal-icon-tenement', label: '绑定负责人', prop: 'user', key: 'business_project_user'},
                    {type: 'portal-icon-edit', label: '修改', prop: 'edit', key: 'business_modify'},
                    {type: 'portal-icon-delete', label: '删除', prop: 'delete', key: 'business_delete'}
                ],
                tableData: [],
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                searchName: '',
                searchOrg: {},
                dialogVisible: false,
                dialogData: null,
                isEditType: false,
                expands: [],
                orgTree: [],
                userVisible: false,
                userData: null
            }
        },
        computed: {
            columns () {
                return [
                    {prop: 'name', label: '名称'},
                    {prop: 'org_name', label: '所属组织机构'},
                    {prop: 'description', label: '描述'},
                    {prop: 'usernames', label: `${this.IsBussiness}负责人`}
                ]
            },
            IsBussiness () {
                return this.businessOrproject === 'business' ? '业务' : '项目'
            },
            ...mapGetters(['businessOrproject'])
        },
        methods: {
            getRowKey (row) {
                return row.id
            },
            /**
             * @description 打开增加业务dialog
             */
            addBusiness () {
                this.isEditType = false
                this.dialogData = null
                this.dialogVisible = true
            },
            /**
             * @description 表格操作
             */
            handleOperation (obj) {
                // 修改
                if (obj.id === 'edit') {
                    this.isEditType = true
                    this.dialogData = obj.row
                    this.dialogVisible = true
                } else if (obj.id === 'user') {
                    this.userData = obj.row
                    this.userVisible = true
                } else if (obj.id === 'delete') {
                    this.$confirm('是否要删除业务' + obj.row.name, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        api.deleteBusiness({id: obj.row.id}).then(res => {
                            if (!res.id) {
                                this.$notify({
                                    type: 'warning',
                                    message: '业务下存在应用，不可删除'
                                })
                            } else {
                                this.$notify({
                                    type: 'success',
                                    message: '删除成功'
                                })

                                this.getList()
                            }
                        })
                    }).catch(() => {
                    })
                }
            },
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getList()
            },
            handleCurrentChange () {
                this.getList()
            },
            /**
             * @description 获取业务list
             */
            getList (updateBusinessId) {
                let param = {
                    limit: this.pagination.size,
                    page: this.pagination.index,
                    name: this.searchName,
                    org_id: this.searchOrg.org_id
                }
                api.getBusinessList(param).then(res => {
                    this.tableData = res.business
                    this.pagination.count = res.page_count || 1
                    this.pagination.total = res.total || 0
                    this.expands = updateBusinessId ? [updateBusinessId] : []
                })
            },
            closeuserDialog () {
                this.userVisible = false
            },
            updateUser () {
                this.closeuserDialog()
                this.getList()
            },
            /**
             * @description 关闭弹出框回调
             */
            closeDialog () {
                this.dialogVisible = false
            },
            /**
             * @description 新增或修改后弹出框回调
             */
            update () {
                this.closeDialog()
                this.getList()
            },
            /**
             * @description 按所属组织机构查询
             */
            query () {
                this.pagination.index = 1
                this.getList()
            },

            getAppOrgTree () {
                OrgApi.getOrgTree().then(res => {
                    this.orgTree = res
                })
            }
        },
        created () {
            this.getList()
            this.getAppOrgTree()
        }

    }
</script>

<style lang="scss" scoped>
</style>