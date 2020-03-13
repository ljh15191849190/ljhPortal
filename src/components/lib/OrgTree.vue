<template lang="pug">
    div.org-tree(v-clickoutside="handleClickOutSide")
        div(@click="inputClick")
            el-input(:placeholder="placeholder" 
                size="small"
                readonly
                v-model="selectedLabel"
                :name="name"
                suffix-icon="el-icon-arrow-down"
                :class="{'is-danger': isDanger}"
                @blur="handleBlur"
            )
            div.filter-container(v-show="isShowTree")
                el-tree.filter-tree.margin-top(
                    show-checkbox
                    :check-strictly="true"
                    :data="nodeTreeData"
                    :props="defaultProps"
                    :highlight-current="isHighlight"
                    :default-expanded-keys="defaultExpKeys"
                    :default-checked-keys="selectNodes"
                    :node-key="defaultProps.node_id"
                    @check="nodeCheck"
                    ref="orgTree"
                    element-loading-spinner="ucmp-icon-loading"
                    :expand-on-click-node="false"
                )
                    span.custom-tree-nodes(slot-scope="{ node, data }")
                        span.custom-tree-nodes(v-if="data[defaultProps.children] && data[defaultProps.children].length")
                            span
                                span
                                    i.org.portal-icon-organization_tree
                                span {{node.label}}
                            span
                                el-checkbox(v-model="data.checked" @change="nodeCheckAll(data)") 全选
                        span(v-else)
                            span
                            i.org.portal-icon-organization_tree
                            span {{node.label}}
                            span.icon

</template>

<script>
/**
 * @description 通用组件：组织机构
 * @augments [placeholder] 输入对象(placeholder省略文本)
 * @augments [defaultProps] 下拉树属性配置
 * @augments [treeData] 下拉树绑定的数据
 * @author davidPan
 */
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    name: 'OrgTree',
    props: ['placeholder', 'selectNodes', 'defaultProps', 'treeData', 'isDanger', 'name'],
    data () {
        return {
            isHighlight: true,
            defaultExpKeys: [],
            selectedLabel: '',
            isShowTree: false,
            checked: true,
            nodeTreeData: [],
            selectNodeIds: []
        }
    },
    methods: {
        init () {
            this.nodeTreeData = JSON.parse(JSON.stringify(this.treeData))
            this.initNodeTree(this.nodeTreeData)
            this.defaultExpKeys = [this.nodeTreeData[0][this.defaultProps.node_id]]
        },
        /**
         * @description 初始化节点数据
         */
        initNodeTree (nodeTreeData) {
            for (let i = 0; i < nodeTreeData.length; i++) {
                if (nodeTreeData[i][this.defaultProps.children] && nodeTreeData[i][this.defaultProps.children].length) {
                    this.$set(nodeTreeData[i], 'checked', false)
                    this.initNodeTree(nodeTreeData[i][this.defaultProps.children])
                }
            }
        },
        handleBlur (event) {
            setTimeout(() => {
                this.$emit('blur')
            }, 50)
        },
        /**
         * @description 输入框点击事件
         */
        inputClick () {
            this.isShowTree = !this.isShowTree
        },
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShowTree = false
        },
        /**
         * @description 设置input显示
         */
        setSelectNodesDisplay (checkedNodes, isInit = false) {
            if (!checkedNodes || !checkedNodes.length) { this.selectedLabel = '' } else {
                this.selectedLabel = checkedNodes.reduce((result, item, idx, arr) => {
                    result += item[this.defaultProps.label]
                    if (idx !== arr.length - 1) { result += ', ' }
                    return result
                }, '')
            }
            
            this.$emit('input', this.selectedLabel)
            if (!isInit) { this.handleBlur() }
        },
        /**
         * @description 单选事件
         */
        nodeCheck (data, node) {
            this.$emit('update:selectNodes', node.checkedKeys)
        },
         /**
         * @description 全选事件
         */
        nodeCheckAll (data) {
            this.selectNodeIds = this.$refs.orgTree.getCheckedKeys()
            this.allNodeCheckEvent(data)
            this.$emit('update:selectNodes', this.selectNodeIds)
        },
        /**
         * @description 全选事件
         */
        allNodeCheckEvent (data) {
            if (!data) return
            if (data.checked === false) { this.removeSelectNodes(data) } else { this.addSelectNodes(data) }
        },
        /**
         * @description 添加选中的节点
         */
        addSelectNodes (data) {
            if (data.checked === false) data.checked = !data.checked
            let selectNodeIds = [...this.selectNodeIds, data[this.defaultProps.node_id]]
            this.selectNodeIds = [...new Set(selectNodeIds)]
            for (let i = 0; data[this.defaultProps.children] && i < data[this.defaultProps.children].length; i++) { this.addSelectNodes(data[this.defaultProps.children][i]) }
        },
        /**
         * @description 去除选中的节点
         */
        removeSelectNodes (data) {
            if (data.checked) data.checked = !data.checked
            let findIdIndex = this.selectNodeIds.findIndex(item => item === data[this.defaultProps.node_id])
            if (findIdIndex > -1) { this.selectNodeIds.splice(findIdIndex, 1) }
            
            for (let i = 0; data[this.defaultProps.children] && i < data[this.defaultProps.children].length; i++) { this.removeSelectNodes(data[this.defaultProps.children][i]) }
        }
    },
    created () {
        this.init()
    },
    watch: {
        'selectNodes.length': {
            handler (newVal) {
                this.$nextTick(() => {
                    this.$refs.orgTree.setCheckedKeys(this.selectNodes)
                    let checkedNodes = this.$refs.orgTree.getCheckedNodes()
                    this.setSelectNodesDisplay(checkedNodes, true)
                })
            },
            immediate: true
        }
    },
    directives: {
        clickoutside
    }
}
</script>

<style lang="scss" scoped>
.org-tree {
    width: 100%;
    position: relative !important;
    .filter-container {
        background-color: #fff;
        padding-right: 5px;
        margin-top: 10px;
        width: 100%;
        max-width: 480px;   
        height: 200px;
        border: 1px solid #e6e6e6;
        overflow: auto;
        position: absolute;
        z-index: 10001;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        .filter-tree {
            min-width: 200px;
        }
        .org {
            color: #aaa;
            padding-right: 5px;
        }
    }
    .custom-tree-nodes {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
}
</style>

