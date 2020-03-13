<template lang="pug">
    div
        el-input.menu-input-filter(v-model="keyword" placeholder='关键词查询' size="mini")
        el-tree(
            :data="treeData"
            :node-key='options.nodeKey'
            :props="options.defaultProps"
            default-expand-all
            :expand-on-click-node="false"
            ref="tree"
            :filter-node-method="filterNode"
        )
            span.custom-tree-node(slot-scope="{ node, data }")
                span(:class="[data.menu_source === 'default' ? 'default-menu-node' : 'custom-menu-node', data.icon ? data.icon : '']") {{ node.label }}
                span.margin-left
                    IconButton(type="portal-icon-add" :disable="isSaving" v-if="addNodeAble(node, data)" @iconClick="handleOperation" :args="{id: 'add', node, data}" text="增加菜单")
                    IconButton(type="portal-icon-delete" :disable="isSaving" v-if="deleteNodeAble(node, data)" @iconClick="handleOperation" :args="{id: 'delete', node, data}" text="删除菜单")
                    IconButton(type="portal-icon-edit" :disable="isSaving" v-if="editNodeAble(node, data)" @iconClick="handleOperation" :args="{id: 'edit', node, data}" text="编辑菜单")
        //- 增加节点
        el-dialog(
            v-if="dialogSwitch"
            title="增加菜单"
            :visible.sync="dialogSwitch"
            width="40%"
            :before-close="handleClose"
        )
           el-form(ref="addNodeForm" :model="addNodeFormData" size="mini" :rules="rules" label-width="120px")
            el-form-item(:label="checkedNode.node.level === 1 ? '一级菜单目录' : '菜单目录'" prop="title")
                el-input(v-model="addNodeFormData.title")
            el-form-item(v-if="checkedNode.node.level === 1" label="直接跳转" prop="useAsLink")            
                el-switch(v-model="addNodeFormData.useAsLink")
            el-form-item(v-if="checkedNode.node.level === 1 && !addNodeFormData.useAsLink" label="二级菜单目录" prop="leave_title")
                el-input(v-model="addNodeFormData.leave_title")
            el-form-item(label="URL地址" prop="url")
                el-input(v-model="addNodeFormData.url")
            el-form-item
                el-button(size="mini" @click="handleClose") 取消
                el-button(size="mini" @click="saveMenu" type="primary" :loading="isSaving") 保存
        //- 修改节点
        el-dialog(
            v-if="editSwitch"
            title="修改菜单"
            :visible.sync="editSwitch"
            width="40%"
            :before-close="closeEditDialog"
        ) 
            el-form(ref="editNodeForm" size="mini" :model="updateNodeFormData" :rules="editRules" label-width="120px")
                el-form-item(label="菜单名称" prop="title")
                    el-input(v-model="updateNodeFormData.title")
                el-form-item(v-if="editedNodeInitUrl && !checkedNode.node.childNodes.length" label="URL地址" prop="url")
                    el-input(v-model="updateNodeFormData.url")
                el-form-item
                    el-button(size="mini" @click="closeEditDialog") 取消
                    el-button(size="mini" @click="updateMenu" type="primary" :loading="isSaving") 保存
</template>
<script>
/**
 * @description 菜单管理 
 * 1. 树形结构展示所有层级菜单
 * 2. 菜单的增|删|改 事件交互
 */
import IconButton from '@lib/IconButton'
import MenuApi from '@api/axios.menu'

let copiedUpdateTitle = null

export default {
    props: {
        treeData: {
            type: Array,
            default: []
        },
        activeTab: {
            type: String,
            default: null
        }
    },
    data () {
        let validateRepeated = (rule, value, callback) => {
            if (value !== copiedUpdateTitle) {
                MenuApi.validateRepeatedMenuName(value).then(
                    res => {
                        if (!res.code) {
                            callback(new Error('该菜单名称已存在，请重新输入'))
                        } else {
                            callback()
                        }
                    }
                )
            } else {
                callback()
            }
        }
        return {
            options: {
                nodeKey: 'id',
                defaultProps: {
                    children: 'subMenus',
                    label: 'title'
                }
            }, // 树关键配置项
            keyword: '', // 关键词
            dialogSwitch: false, // 增加节点的模态框开关
            editSwitch: false, // 修改节点的模态框开关
            addNodeFormData: {}, // 增加节点的表单数据
            updateNodeFormData: {
                title: null,
                url: null
            }, // 修改节点的表单数据
            checkedNode: null, // 选中节点的信息（node、data）
            isSaving: false, // 正在保存/更新/删除操作
            rules: {
                title: [
                    {required: true, message: '请输入菜单名称', trigger: 'blur'},
                    {max: 8, message: '菜单名称最长8个字符', trigger: 'blur'},
                    {validator: validateRepeated, trigger: 'blur'}
                ],
                leave_title: [
                    {required: true, message: '请输入二级菜单名称', trigger: 'blur'},
                    {max: 8, message: '二级菜单名称最长8个字符', trigger: 'blur'},
                    {validator: validateRepeated, trigger: 'blur'}
                ],
                url: [
                    {required: true, message: '请输入URL地址', trigger: 'blur'}
                ]
            },
            editRules: {
                title: [
                    {required: true, message: '请输入菜单名称', trigger: 'blur'},
                    {max: 8, message: '菜单名称最长8个字符', trigger: 'blur'},
                    {validator: validateRepeated, trigger: 'blur'}
                ],
                url: [
                    {required: true, message: '请输入URL地址', trigger: 'blur'}
                ]
            },
            editedNodeInitUrl: null
        }
    },

    methods: {
        // 操作分流
        handleOperation (args) {
            if (args.id === 'add') {
                this.addNode(args.node, args.data)
                return
            }

            if (args.id === 'delete') {
                this.deleteNode(args.node, args.data)
                return
            }
            this.updateNode(args.node, args.data)
        },

        // 增加节点前，表单数据初始化
        addNode (node, data) {
            this.checkedNode = {node, data}
            if (node.level === 1) {
                this.$set(this.addNodeFormData, 'title', null)
                this.$set(this.addNodeFormData, 'useAsLink', false)
                this.$set(this.addNodeFormData, 'leave_title', null)
                this.$set(this.addNodeFormData, 'url', null)
            } else {
                this.$set(this.addNodeFormData, 'title', null)
                this.$set(this.addNodeFormData, 'url', null)
            }

            this.dialogSwitch = true
        },

        // 修改节点前，打开模态框，表单数据初始化
        updateNode (node, data) {
            this.checkedNode = {node, data}
            this.updateNodeFormData.title = data.title
            copiedUpdateTitle = data.title
            // UCMP3-6103 初始化选中菜单的url，作为是否显示url字段的条件
            this.editedNodeInitUrl = data.url
            if (data.url) {
                this.$set(this.updateNodeFormData, 'url', data.url)
            }
            this.editSwitch = true
        },

        // 增加节点，提交表单前，校验表单
        saveMenu () {
            this.$refs.addNodeForm.validate((valid) => {
                if (valid) {
                    this.submitToEnd(this.checkedNode.node, this.addNodeFormData)
                }
            })
        },

        // 增加节点，提交表单数据到后端
        submitToEnd (node, data) {
            let form = {}
            form.parent_id = node.data.id
            form.title = data.title
            form.sys_module_id = this.activeTab
            form.url = null

            this.isSaving = true
            if (node.level === 2) {
                form.url = data.url
                MenuApi.addSubMenu(form).then(
                    res => {
                        this.$notify({
                            type: 'success',
                            message: '菜单' + form.title + '保存成功'
                        })
                        this.isSaving = false

                        // 模拟菜单数据给树
                        let _menu = JSON.parse(JSON.stringify(res[0]))
                        _menu.subMenus = []
                        if (!node.data.subMenus) this.$set(node.data, 'subMenus', [])
                        node.data.subMenus.push(_menu)
                        this.handleClose()
                    }, err => {
                        console.log(err)
                        this.isSaving = false
                    }
                )
            } else if (node.level === 1) {
                form.subMenus = {}
                if (data.useAsLink) form.url = data.url
                else {
                    form.subMenus.title = data.leave_title
                    form.subMenus.url = data.url
                }
                MenuApi.addMenu(form).then(
                    res => {
                        this.$notify({
                            type: 'success',
                            message: '菜单' + form.title + '保存成功'
                        })
                        this.isSaving = false

                        // 模拟菜单数据给树
                        let _menu = {}
                        if (res.length === 2) {
                            _menu = res[0].parent_id === node.data.id ? res[0] : res[1]
                            _menu.subMenus = []
                            _menu.subMenus.push(res[0].parent_id === node.data.id ? res[1] : res[0])
                        } else {
                            _menu = res[0]
                            _menu.subMenus = []
                        }

                        if (!node.data.subMenus) this.$set(node.data, 'subMenus', [])
                        node.data.subMenus.push(_menu)
                        this.handleClose()
                    }, err => {
                        console.log(err)
                        this.isSaving = false
                    }
                )
            }
        },

        addChildToTree (data, form) {
            if (!data.children) this.$set(data, 'children', [])
            data.children = data.children.concat(form)
        },

        // 更新表单，校验表单内容是否合法
        updateMenu () {
            this.$refs.editNodeForm.validate((valid) => {
                if (valid) {
                    this.isSaving = true
                    MenuApi.updateMenu({...this.updateNodeFormData, ...{id: this.checkedNode.data.id}}).then(
                        res => {
                            this.$notify({
                                type: 'success',
                                message: '菜单' + this.updateNodeFormData.title + '更新成功'
                            })
                            this.checkedNode.node.data.title = this.updateNodeFormData.title
                            this.checkedNode.node.data.url = this.updateNodeFormData.url

                            this.isSaving = false
                            
                            this.closeEditDialog()
                        }, err => {
                            console.log(err)
                            this.isSaving = false
                        }
                    )
                }
            })
        },

        // 关闭增加节点表单的模态框
        handleClose () {
            Object.keys(this.addNodeFormData).forEach(key => {
                if (this.addNodeFormData.hasOwnProperty(key)) {
                    delete this.addNodeFormData[key]
                }
            })
            this.checkedNode = null
            this.dialogSwitch = false
        },

        // 关闭修改节点表单的模态框
        closeEditDialog () {
            this.updateNodeFormData.title = null
            this.updateNodeFormData.url = null
            this.checkedNode = null

            copiedUpdateTitle = null

            this.editSwitch = false
        },

        // 删除节点
        deleteNode (node, data) {
            this.$confirm('是否要删除菜单' + data.title, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.isSaving = true
                MenuApi.deleteMenu({id: data.id}).then(
                    res => {
                        if (node.parent.childNodes.length > 1) {
                            this.successDeleteNode(data.title, node, data)
                        } else {
                            // UCMP3-5560 如果父节点只有一个子菜单且已经被删除，自动删除父节点
                            MenuApi.deleteMenu({id: node.parent.data.id}).then(
                                res => {
                                    this.successDeleteNode(data.title, node.parent, node.parent.data)
                                }, err => {
                                    console.log(err)
                                    this.isSaving = false
                                }
                            )
                        }
                    }, err => {
                        console.log(err)
                        this.isSaving = false
                    }
                )
            }).catch(() => {
            })
        },

        successDeleteNode (title, node, data) {
            this.$notify({
                type: 'success',
                message: '菜单' + title + '删除成功'
            })
            // 删除当前树节点Dom数据
            const parent = node.parent
            const children = parent.data.subMenus
            const index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
            this.isSaving = false
        },

        // 表单关键词过滤
        filterNode (value, data) {
            if (!value) return true
            return data.title.indexOf(value) !== -1
        },

        // 当前节点是否可以使用增加按钮
        addNodeAble (node, data) {
            // 根目录节点(产品模块)可以直接使用增加
            if (node.level === 1) {
                return true
            }

            // 二级节点(菜单根目录) && 系统内置菜单 && 当前节点有子节点 可以使用增加 (特殊情况不能添加：控制台、总览、资源管理)
            if (node.level === 2 && data.menu_source === 'default' && node.childNodes.length && data.url !== 'console' && data.url !== 'dashboard') {
                return true
            }

            // 二级节点(菜单根目录) && 用户自定义菜单 && 当前节点没有指定url(认为只是作为一级菜单目录，不做跳转) 可以使用增加
            if (node.level === 2 && data.menu_source !== 'default' && !data.url) {
                return true
            }

            // 其他场景默认不能使用增加
            return false
        },

        // 当前节点是否可以使用删除按钮
        deleteNodeAble (node, data) {
            // 用户自定义的菜单节点 && 没有子节点 可以使用删除
            if (data.menu_source !== 'default' && !node.childNodes.length) return true
            
            // 其他场景默认不使用删除按钮
            return false
        },

        // 当前节点是否可以使用修改按钮
        editNodeAble (node, data) {
            // 用户自定义菜单可以使用修改按钮
            return data.menu_source !== 'default'
        }
    },

    watch: {
        keyword (val) {
            this.$refs.tree.filter(val)
        }
    },

    components: {
        IconButton
    }
}
</script>
<style lang="scss" scoped>
.menu-input-filter {
    padding-left: 10px;
    width: 250px;
}
.default-menu-node {
    font-size: 14px;
    font-weight: 420;
}
.custom-menu-node {
    font-size: 14px;
    font-weight: 320;
}
</style>
