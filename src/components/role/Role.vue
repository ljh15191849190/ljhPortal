<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 角色管理

        el-button.breadcrumb-btn(v-btn-privilege="'role_create'" @click="addRole" type="primary" size="small" icon="el-icon-plus") 创建角色

        div.portal-content.with-search
            el-row
                label.search-label 角色名称
                el-input(placeholder="请输入角色名称" size="small" v-model="queryWord" clearable)
                el-button(type="primary" size="small" @click="queryByKeyword") 查询

            el-table(:data="tableData" size="small" stripe)
                el-table-column(v-for="column in columns" :key="column.prop" :type="column.type" :prop="column.prop" :label="column.label" :width="column.width" :fixed="column.fixed")
                    template(slot-scope="scope")
                        span {{column.labelMap ? column.labelMap[scope.row[column.prop]] : scope.row[column.prop]}}
                el-table-column(label="操作")
                    template(slot-scope="scope")
                        icon-button(v-btn-privilege="'role_see'" @iconClick="handleOperationSee(scope.row)" :type="'portal-icon-see'" :text="'查看'" :args="{id: 'see', row: scope.row}")
                        Icon-Button(v-btn-privilege="operation.key" v-for="operation in operations" :key="operation.prop" :type="operation.type" v-if="isShowOpr(scope.row, operation.prop)" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
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

        CreateRole(v-if="dialogVisible" :roleId="roleId" :IsSee="IsSee" :roleName="roleName" :visible="dialogVisible" :isEdit="isEditType" @closeDialog="closeDialog" @updateRole="update")
</template>
<script>
    /**
     * @description 角色管理
     */
    import RoleApi from '@api/axios.role'
    import fixedRoleName from '@mock/role/fixedRoleName'
    import IconButton from '@lib/IconButton'
    import CreateRole from './CreateRole'
    import {mapGetters} from 'vuex'

    export default {
        data () {
            return {
                tableData: [],
                operations: [
                    {
                        type: 'portal-icon-edit',
                        label: '修改',
                        prop: 'edit',
                        key: 'role_modify'
                    },
                    {
                        prop: 'delete',
                        label: '删除',
                        type: 'portal-icon-delete',
                        key: 'role_delete'
                    }

                ],
                visible: false,
                checkedRoleId: null,
                checkedRoleInfo: [],
                payloadMenus: [],
                queryWord: '',
                originTableData: [],
                dialogVisible: false,
                isEditType: false,
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                roleId: '',
                IsSee: '',
                roleName: '',
                projectId: localStorage.getItem('tenant')
            }
        },
        methods: {
            //查看
            handleOperationSee (obj) {
                this.dialogVisible = true
                this.roleId = obj.id
                this.roleName = obj.name
                this.IsSee = 'see'
                this.isEditType = true
            },
            /**
             * @description 表格切换每页展示
             */
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getRoleList(this.queryWord)
            },
            /**
             * @description 表格切换页
             */
            handleCurrentChange () {
                this.getRoleList(this.queryWord)
            },
            /**
             * @description 获取所有角色list
             * @param query 存在则在计算当页数据时过滤
             */
            getRoleList (query) {
                RoleApi.getRoleList(this.projectId, this.pagination.index, this.pagination.size, query ? query : '').then(res => {
                    // 先排序，再分页
                    this.tableData = res.roles
                    this.pagination.total = res.total
                })
            },
            addRole () {
                this.dialogVisible = true
                this.roleId = 'add'
                this.isEditType = false
            },
            deleteRole (obj) {
                let vm = this
                vm.$confirm('确定要删除该角色吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    RoleApi.deleteRole(obj.row.id).then(res => {
                        vm.$notify({
                            title: '通知',
                            type: 'success',
                            message: '删除成功!'
                        })

                        this.getRoleList(this.queryWord)
                    })
                }).catch(() => {
                })
            },
            updateRole (obj) {
                this.dialogVisible = true
                this.roleId = obj.row.id
                this.roleName = obj.row.name
                this.IsSee = obj.id
                this.isEditType = true
            },
            handleOperation (obj) {
                //删除操作
                if (obj.id === 'delete') this.deleteRole(obj)
                else if (obj.id === 'edit') {
                    // TODO  不需要
                    // guardian_admin 不可修改， admin用户的guardian_admin是不可修改的
                    if (obj.row.name === fixedRoleName) {
                        this.$notify({
                            type: 'warning',
                            message: fixedRoleName + ' 角色是系统默认角色，不可修改名称'
                        })
                        return
                    }
                    this.updateRole(obj)
                } else {
                    // 分配菜单
                    this.checkedRoleId = obj.row.id
                    RoleApi.getRoleByRoleId(this.checkedRoleId).then(res => {
                        if (!res) {
                            return
                        }
                        this.visible = true

                        this.checkedRoleInfo = res
                        if (!this.checkedRoleInfo.role_menu) {
                            this.$set(this.checkedRoleInfo, 'role_menu', [])
                        }
                        //获得keys高亮显示选中
                        let parent = res.role_menu.filter(item => {
                            return item.parent_id === null
                        })
                        let children = res.role_menu.filter(item => {
                            return item.parent_id !== null
                        })
                        parent.forEach(pitem => {
                            children.forEach(citem => {
                                if (pitem.id === citem.parent_id) {
                                    if (!pitem.subMenus) {
                                        pitem.subMenus = []
                                    }
                                    pitem.subMenus.push(citem)
                                }
                            })
                        })

                        parent.forEach(item => {
                            this.data.forEach(menuItem => {
                                if (item.id === menuItem.id && menuItem.subMenus && item.subMenus && menuItem.subMenus.length > 0 && menuItem.subMenus.length > item.subMenus.length) {
                                    this.checkedRoleInfo.role_menu.forEach((checkedKey, index) => {
                                        if (checkedKey === item._id) {
                                            this.checkedRoleInfo.role_menu.splice(index, 1)
                                        }
                                    })
                                }
                            })
                        })
                    })
                }
            },
            /**
             * @description 增加及修改后的回调函数
             */
            update () {
                this.closeDialog()
                this.getRoleList(this.queryWord)
            },
            closeDialog () {
                this.dialogVisible = false
            },
            closeModal () {
                this.visible = false
                this.checkedRoleId = null
            },
            /**
             * @description 模糊搜索角色名称
             */
            queryByKeyword () {
                /*
                * 原子作业平台ATOMFLOWAT-151
                * 问题原因：功能缺失
                */
                this.pagination.index = 1
                this.getRoleList(this.queryWord)
            },
            isShowOpr (obj, prop) {
                // return this.apps.findIndex(appItem => appItem.type === obj.name) < 0 || (prop !== 'delete' && this.apps.findIndex(appItem => appItem.type === obj.name) > -1)
                // UCMP-712【角色管理】atomflow_admin和cmdb_admin应该有删除按钮
                // 重新梳理权限，即为 guardian_admin 不可删除外，其他操作均可

                // UCMP3-1856 ucmp_root不能操作
                // TODO 角色是否能被删除 用role
                return !(prop === 'delete' && obj.name === fixedRoleName) && obj.name !== 'ucmp_root' && !obj.init
            },
            reset () {
                this.closeModal()
            }
        },
        created () {
            // this.operations = operations
            this.getRoleList()
        },
        components: {
            IconButton,
            CreateRole
        },
        computed: {
            columns () {
                return [
                    {
                        prop: 'name',
                        label: '角色名称'
                    }, {
                        prop: 'platform_name',
                        label: '产品模块',
                        labelMap: this.appLabelMap
                    }, {
                        prop: 'role_data_name',
                        label: '权限类型'
                    }
                ]
            },
            appLabelMap () {
                let labelObj = {}
                this.apps.forEach(app => {
                    labelObj[app.prop] = app.label
                })

                return labelObj
            },
            ...mapGetters([
                'apps'
            ])
        }
    }
</script>
<style lang="scss" scoped>

</style>
