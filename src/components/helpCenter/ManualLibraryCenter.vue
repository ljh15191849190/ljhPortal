<template lang="pug">
    div.portal-non-left-nav.message-center
        div.title.flex-between
            span
                span 知识库
                el-button.back(type="info" plain size="mini" icon="portal-icon-back" @click="back") 返回
        div.pagecontant
            el-table(:data="tablelist" size="small" v-loading="loadingTable" element-loading-spinner="ucmp-icon-loading")
                el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" show-overflow-tooltip)
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'operation'")
                            a.buttonstyle(v-if="scope.row.manual_name" :href="'/gd/v2/sys/support/manual/download/' + scope.row.manual_name") 下载
                        span(v-else) {{scope.row[column.prop]}}
</template>
<script>
    import HelpCenterApi from '@api/axios.helpcenter'

    /**
     * 知识库-列表
     *
     * @description
     * @author jia.lu
     */

    export default {
        name: 'ManualLibraryCenter',
        data () {
            return {
                columns: [
                    {prop: 'real_name', label: '文档名称'},
                    {prop: 'time', label: '上传时间'},
                    {prop: 'operation', label: '操作', width: '300px'}
                ],
                table_list: [],
                loadingTable: false
            }
        },
        computed: {
            tablelist () {
                return this.table_list.filter(item => item.manual_name !== null)
            }
        },
        created () {
            this.getTemplateList()
        },
        methods: {
            // 列表
            getTemplateList () {
                this.loadingTable = true
                HelpCenterApi.getdownLoadList('docs').then(res => {
                    if (res) {
                        this.table_list = res
                        this.loadingTable = false
                    }
                }, () => {
                    this.loadingTable = false
                })
            },

            back () {
                let product = sessionStorage.getItem('portal-route-navbar')
                let beforeMessageCenter = sessionStorage.getItem('before-message-center')
                // 其他产品 创建的时候会回到上一次访问的路由
                if (product !== 'system') this.$router.push('/content/product/' + product)
                // 系统管理下的需要记忆的路由跳转
                else this.$router.push(beforeMessageCenter ? beforeMessageCenter : '/content/system/user')
            }
        }
    }
</script>
<style lang="scss" scoped>
    .floatright {
        float: right;
    }

    .back {
        margin-left: 10px
    }

    .buttonstyle {
        margin-top: 5px;
        font-size: 12px;
        cursor: pointer;
        display: inline-block;
        line-height: 1;
        white-space: nowrap;
        background: #FFFFFF;
        border: 1px solid #DCDFE6;
        border-color: #DCDFE6;
        color: #333333;
        -webkit-appearance: none;
        text-align: center;
        box-sizing: border-box;
        outline: none;
        margin: 0;
        transition: .1s;
        font-weight: 500;
        padding: 8px 20px;
        border-radius: 4px;
    }

    .pagecontant {
        height: calc(100vh - 200px);
        overflow: auto;
    }
</style>
