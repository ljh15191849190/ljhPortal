<template lang="pug">
    div.full-content
        el-table(:data="msgModelList" size="small" v-loading="loadingTable" element-loading-spinner="ucmp-icon-loading")
            el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" show-overflow-tooltip)
                template(slot-scope="scope")
                    span(v-if="column.prop === 'operation'")
                        el-button(v-btn-privilege="'msg_template_modify'" size="small" type="text" @click="openEditDialog(scope.row)") 编辑
                    span(v-else-if="column.prop === 'template_list'") {{getTemplateLabel(scope.row[column.prop])}}
                    span(v-else) {{scope.row[column.prop]}}
            //- el-row.pagination-row
            //-     el-pagination(
            //-         background
            //-         @size-change="handleSizeChange"
            //-         @current-change="handleCurrentChange"
            //-         :current-page.sync="pagination.index"
            //-         :page-sizes="[10, 20, 50, 100]"
            //-         :page-size="pagination.size"
            //-         layout="sizes, prev, pager, next"
            //-         :page-count="pagination.count")
        EditModelDialog(:dialogVisible.sync="dialogVisible" :editTemplateObj="editTemplateObj" @saveTemplate="saveTemplate")
</template>

<script>
    /**
     * @description 消息中心 ==> 消息模板
     */

    import MessageCenterApi from '@api/axios.messageCenter'
    import EditModelDialog from './child/EditModelDialog'

    export default {
        data () {
            return {
                msgModelList: [],
                loadingTable: false,
                columns: [
                    {prop: 'strategy_app_name', label: '模块名称'},
                    {prop: 'template_list', label: '模板类型'},
                    {prop: 'operation', label: '操作'}

                ],
                dialogVisible: false,
                editTemplateObj: {},
                pagination: {
                    size: 999999,
                    index: 1,
                    count: 1
                }
            }
        },
        created () {
            this.refreshTemplateList(this.pagination)
        },
        methods: {
            openEditDialog (data) {
                this.dialogVisible = true
                this.editTemplateObj = JSON.parse(JSON.stringify(data))
            },
            // 保存编辑后的模板
            saveTemplate () {
                this.dialogVisible = false
                // 构造保存模板编辑后的保存的参数
                let sendParams = {
                    app_id: this.editTemplateObj.app_id,
                    template_list: []
                }
                if (Array.isArray(this.editTemplateObj.template_list)) {
                    this.editTemplateObj.template_list.forEach(template => {
                        sendParams.template_list.push({
                            id: template.id,
                            title: template.title,
                            content: template.content
                        })
                    })
                }
                /**
                 * 保存模板API调用
                 */
                MessageCenterApi.saveModifyTemplate(sendParams).then(res => {
                    this.refreshTemplateList(this.pagination)
                })
            },
            // 分页设置
            handleSizeChange () {
                this.refreshTemplateList(this.pagination)
            },
            handleCurrentChange () {
                this.refreshTemplateList(this.pagination)
            },
            // 处理列表中需要展示模板类型
            getTemplateLabel (list = []) {
                return list.map(item => item.type_name).join(',')
            },
            // 更新模板列表
            refreshTemplateList () {
                this.loadingTable = true
                MessageCenterApi.getMsgTemplateList().then(res => {
                    if (res) {
                        this.msgModelList = res.template_list
                        // this.pagination.count = res.page_count
                        this.loadingTable = false
                    }
                }, () => {
                    this.loadingTable = false
                })
            }
        },
        components: {
            EditModelDialog
        }
    }
</script>

