<template lang="pug">
    div.sub-app-list
        el-row(type="flex" justify="space-between")
            el-col.d-flex(:span="12")
                el-row(type="flex" justify="start")
                    el-input.normal-query-widget(size="mini" v-model="queryWord" placeholder="请输入应用名称" clearable)
                    el-button.margin-left(size="mini" type="primary" @click="query") 查询
                el-button.margin-left(size="mini" @click="openAuthorize" :disabled="!checkedList.length") 授权
            el-col.text-right(:span="12")
                el-button.breadcrumb-btn(v-btn-privilege="'business_app_create'" size="mini" type="primary" @click="createApp" icon="el-icon-plus") 创建应用
        el-table.margin-top(ref="table" :data="tableData" row-key="id" size="mini" stripe max-height="300" @selection-change="selectTableItem")
            el-table-column(type="selection" width="55" reserve-selection)
            el-table-column(label="应用名称" prop="app_name")
            el-table-column(label="应用简称" prop="short")
            el-table-column(label="描述" prop="description")
            el-table-column(label="应用负责人" prop="usernames")
                template(slot-scope="scope")
                    span {{scope.row.usernames.join('，')}}
            el-table-column(label="操作" width="130")
                template(slot-scope="scope")
                    Icon-Button(v-btn-privilege="operation.key" v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
        div.pagination-row
            el-pagination(
            size="mini"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="pagination.index"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.size"
            layout="sizes, total, prev, pager, next"
            :page-count="pagination.count"
            :total="pagination.total")
        EditApplication(
        v-if="dialogVisible"
        @updateApp="updateApp"
        @close="closeApp"
        :businessId="businessId"
        :visible="dialogVisible"
        :appData="selectedAppData"
        :isEdit="isEdit")
        BusinessUser(v-if="userVisible" type="app" :data="userData" :visible="userVisible" @closeuserDialog="closeuserDialog" @updateUser="updateUser")
        el-dialog(v-if="visible" title="授权" :visible.sync="visible" :before-close="closeDialog" width="680px")
            div.dialog-body
                el-input(placeholder="请搜索组织机构" 
                    size="small"
                    v-model="searchLable"
                    clearable
                    :name="name"
                    class="mb-10"
                )
                el-tree.org-tree(
                ref="orgRef"
                show-checkbox
                :node-key="nodeKey"
                :props="orgProps"
                :data="orgTree"
                :expand-on-click-node="false"
                :check-on-click-node="true"
                :highlight-current="true"
                :default-checked-keys="defaultCheckedOrg"
                :filter-node-method="filterNode")
            div.dialog-footer(slot="footer")
                i.el-icon-question(v-if="!singleOrgAuth")
                    span.info-color 此处只增加对组织机构的授权，重复授权不覆盖前期选项，如须修改请针对应用单独处理。
                el-button(size="mini" @click="closeDialog") 取消
                el-button(size="mini" @click="saveOrganization" type="primary" :loading="orgSaving") 保存
</template>

<script>
    /**
     * @description 业务下 应用list
     */
    import EditApplication from './EditApplication'
    import BusinessApi from '@api/axios.business'
    import IconButton from '@lib/IconButton'
    import BusinessUser from './BusinessUser'

    export default {
        name: 'SubAppList',
        components: {IconButton, EditApplication, BusinessUser},
        props: ['businessId', 'orgTree'],
        data () {
            return {
                operations: [
                    {type: 'portal-icon-tenement', label: '绑定负责人', prop: 'user', key: 'business_app_user'},
                    {type: 'portal-icon-edit', label: '修改', prop: 'edit', key: 'business_app_modify'},
                    {
                        type: 'portal-icon-organization',
                        label: '修改授权',
                        prop: 'authorize',
                        key: 'business_auth'
                    },
                    {type: 'portal-icon-delete', label: '删除', prop: 'delete', key: 'business_app_delete'}
                ],
                tableData: [],
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                queryWord: '',
                visible: false,
                orgSaving: false,
                checkedList: [],
                nodeKey: 'id',
                orgProps: {
                    label: 'org_name',
                    children: 'sub_orgs'
                },
                defaultCheckedOrg: [],
                singleOrgAuth: false,
                singleAppId: '',
                dialogVisible: false,
                selectedAppData: null,
                isAppEdit: false,
                userData: [],
                userVisible: false,
                searchLable: ''
            }
        },
        methods: {
            closeuserDialog () {
                this.userVisible = false
            },
            updateUser () {
                this.closeuserDialog()
                this.getAppList()
            },
            openAppuser (data) {
                this.userVisible = true
                this.userData = data
            },
            getAppList () {
                let params = {
                    business_id: this.businessId,
                    limit: this.pagination.size,
                    page: this.pagination.index,
                    name: this.queryWord
                }
                BusinessApi.getAppListByBusinessId(params).then(res => {
                    this.tableData = res.apps
                    this.pagination.count = res.page_count
                    this.pagination.total = res.total
                })
            },
            handleOperation (obj) {
                // 修改
                if (obj.id === 'edit') this.editApp(obj.row)
                // 授权
                else if (obj.id === 'authorize') this.openAuthorize(obj.row, true)
                else if (obj.id === 'user') this.openAppuser(obj.row, true)
                // 删除
                else this.deleteApp(obj.row)
            },
            query () {
                this.pagination.index = 1
                this.getAppList()
            },
            createApp () {
                this.isEdit = false
                this.selectedAppData = null
                this.dialogVisible = true
            },
            /**
             * @description 添加业务下应用
             */
            editApp (app) {
                this.isEdit = true
                this.selectedAppData = app
                this.dialogVisible = true
            },

            updateApp () {
                this.closeApp()
                this.getAppList()
            },

            closeApp () {
                this.dialogVisible = false
            },
            /**
             * @description 删除业务下应用
             */
            deleteApp (app) {
                this.$confirm('是否要删除应用' + app.app_name, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    BusinessApi.deleteApp({id: app.id}).then(res => {
                        this.$notify({
                            type: 'success',
                            message: '删除成功'
                        })

                        this.getAppList()
                    })
                })
            },
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getAppList()
            },
            handleCurrentChange () {
                this.getAppList()
            },

            /**
             * 关闭授权弹窗
             */
            closeDialog () {
                this.visible = false
                this.singleAppId = ''
                this.defaultCheckedOrg = []
            },

            /**
             * 打开授权弹窗
             * @param item 单个修改的时候传入当前行数据
             */
            openAuthorize (item, singleOrgAuth) {
                this.singleOrgAuth = !!singleOrgAuth
                if (this.singleOrgAuth) {
                    BusinessApi.getAppAuthorityById(item.id).then(res => {
                        this.visible = true
                        this.singleAppId = item.id
                        this.defaultCheckedOrg = res
                    })
                } else {
                    // 批量
                    this.visible = true
                }
            },

            /**
             * 勾选表格行
             * @param selection所有勾选数据
             */
            selectTableItem (selection) {
                this.checkedList = selection
            },

            /**
             * 保存组织机构
             */
            saveOrganization () {
                let org_ids = this.$refs.orgRef.getCheckedKeys()

                if (!org_ids.length) {
                    return this.$notify({
                        type: 'warning',
                        message: '请勾选组织机构'
                    })
                }

                // org id
                let method = this.singleOrgAuth ? 'editAppAuthority' : 'multipleAddAppAuthority'
                let params = {org_ids}

                // app id
                if (this.singleOrgAuth) params.app_id = this.singleAppId
                else params.app_ids = this.checkedList.map(item => item.id)

                this.orgSaving = true
                BusinessApi[method](params).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '授权成功'
                    })

                    this.closeDialog()
                    this.orgSaving = false
                }).catch(() => {
                    this.orgSaving = false
                })
            },
            filterNode (value, data) {
                if (!value) {
                    return true
                }
                return data[this.orgProps.label].indexOf(value) !== -1
            }
        },
        created () {
            this.getAppList()
        },
        watch: {
            searchLable (val) {
                this.$refs.orgRef.filter(val)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .text-right {
        text-align: right;
    }

    .dialog-body {
        height: 480px;
        overflow-y: auto;
    }

    .dialog-footer {
        position: relative;

        i {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 12px;
            line-height: 28px;
        }

        span {
            margin-left: 8px;
        }
    }
</style>
<style lang="scss">
    .sub-app-list {
        .el-table__body td {
            padding: 3px 0;
        }

        .el-table__body td .el-checkbox {
            margin-bottom: 0;
        }
    }
    .mb-10 {
        margin-bottom: 10px;
    }
</style>
