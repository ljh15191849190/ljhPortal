
<template lang="pug">
    div.pagecontant
        el-table(:data="tablelist" size="small" v-loading="loadingTable" element-loading-spinner="ucmp-icon-loading")
            el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" show-overflow-tooltip)
                template(slot-scope="scope")
                    span(v-if="column.prop === 'operation'")
                        a.buttonstyle(v-if="scope.row.manual_name" :href="'/gd/v2/sys/support/manual/download/' + scope.row.manual_name") 下载
                    span(v-else) {{scope.row[column.prop]}}
</template>

<script>
/**
 * @description 手册说明
 */

import HelpCenterApi from '@api/axios.helpcenter'

export default {
    data () {
        return {
            columns: [
                { prop: 'real_name', label: '手册名称' },
                { prop: 'time', label: '上传时间' },
                { prop: 'operation', label: '操作', width: '300px' }
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
            HelpCenterApi.getdownLoadList().then(res => {
                if (res) {
                    this.table_list = res
                    this.loadingTable = false
                }
            }, () => {
                this.loadingTable = false
            })
        }
    }
}
</script>
<style lang="scss" scoped>
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
.pagecontant{
    height: calc(100vh - 200px);
    overflow: auto;
}
</style>


