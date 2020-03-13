<template lang="pug">
    div.organization
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 组织机构

        div.breadcrumb-btn(v-btn-privilege="'org_sync'" v-if="domainId !== 'default'")
            el-button(@click="syncOrg" type="primary" size="small" plain) 同步组织机构

        div.portal-content.with-search
            div
                label.search-label
                el-input(
                placeholder="输入关键字进行过滤"
                v-model="filterText"
                clearable
                @clear="clearSearch"
                size="small")
                el-button(@click="queryOrg" type="primary" size="small") 查询
                el-button.bind-flag(@click="create('bindflag')" type="primary" size="small") 绑定标识
            div.tree-container
                div.filter-container
                    label.margin-top(v-if="orgRequested && domainIsDefault && !orgHasNode" @click="appendRoot")
                        i.portal-icon-add.theme-color.root-add(type="text" title="添加")
                        span.theme-color 添加组织机构
                    el-tree(
                    v-show="!customSearching"
                    :ref="treeRef"
                    :key="orgTreeKey"
                    :props="treeProps"
                    :load="getOrg"
                    :data="OrgTreeData"
                    lazy
                    :node-key="nodeKey"
                    :expand-on-click-node="false"
                    :highlight-current="true"
                    :render-content="renderContent")

                    // 搜索树
                    el-tree(
                    v-show="customSearching"
                    :data="searchTree"
                    :props="treeProps"
                    :node-key="nodeKey"
                    :expand-on-click-node="false"
                    default-expand-all
                    :highlight-current="true"
                    :render-content="renderContent")
            add-folder(v-if="modalVisible" :visible="modalVisible" :add="isAdd" :checkedNode="checkedNodeData" @closeDialog="closeModal" @insertNode="insertNode")
</template>
<script>
    /**
     * @description 组织机构
     */
    import OrgApi from '@api/axios.organization'
    import AddFolder from './AddFolder'
    import {initWebSocket} from '@leaptocloud/standard-ui'

    export default {
        data () {
            return {
                filterText: '',
                treeRef: 'orgRef',
                isAdd: 2,
                modalVisible: false,
                checkedName: '',
                checkedDictId: null,
                checkedNodeData: null,
                checkedParent: null,
                checkStrictly: true,
                orgRequested: false,
                orgHasNode: true,
                operations: [
                    {
                        type: 'portal-icon-reset-password',
                        label: '添加',
                        prop: 'add'
                    },
                    {type: 'portal-icon-role', label: '编辑', prop: 'edit'},
                    {type: 'portal-icon-role', label: '删除', prop: 'delete'}
                ],
                nodeKey: 'id',
                treeProps: {
                    label: 'org_name',
                    children: 'sub_orgs'
                },
                domainId: localStorage.getItem('domainId'),
                projectId: localStorage.getItem('tenant'),
                customSearching: false,
                searchTree: [],
                OrgTreeData: [],
                treeKeyIndex: 0,
                subscribeInstance: null,
                base_dn: '' // 自动同步的base_dn, 不用每次都输入
            }
        },
        computed: {
            domainIsDefault () {
                return this.domainId === 'default'
            },
            orgTreeKey () {
                return 'orgTree_' + this.treeKeyIndex
            }
        },
        methods: {
            insertNode (node) {
                if (!node.parent_id) {
                    this.refreshOrgTree()
                    this.modalVisible = false
                    return
                }
                //原子作业平台ATOMFLOWAT-119(创建组织机构的时候，输入排序，点击‘确定’，此功能不生效)
                if (this.isAdd === 1) {
                    this.$refs.orgRef.append(node, this.checkedNodeData.id)
                    // 新建根节点
                    if (!this.checkedNodeData.id) {
                        this.modalVisible = false
                        return
                    }
                } else {
                    //
                    this.checkedNodeData.org_name = node.org_name
                }
                this.searchOrgTree()
                this.modalVisible = false
            },
            appendRoot () {
                this.isAdd = 1
                this.modalVisible = true
                this.checkedNodeData = {id: null}
            },
            append (data) {
                this.isAdd = 1
                this.checkedNodeData = data
                this.checkedDictId = data.id
                this.checkedName = ''
                this.modalVisible = true
            },
            // 绑定标识
            create (param) {
                this.isAdd = 0
                this.checkedNodeData = param
                this.modalVisible = true
            },
            update (node, data) {
                this.isAdd = 2
                this.checkedParent = node.parent.data
                this.checkedNodeData = data
                this.checkedDictId = data.id
                this.checkedName = data.org_name
                this.modalVisible = true
            },
            remove (node, data) {
                //原子作业平台ATOMFLOWAT-149(组织机构下已经绑定用户之后，删除组织机构的时候没有给出对应的提示信息)
                let vm = this
                let id = data.id
                let msg = '确定要删除 ' + data.org_name + ' 组织机构吗?'
                vm.$confirm(msg, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    OrgApi.deleteOrg({id}).then(res => {
                        //删除成功操作
                        const parent = node.parent
                        const children = parent.childNodes || []
                        const index = children.findIndex(d => d.data.id === id)
                        children.splice(index, 1)
                        vm.$notify({
                            title: '通知',
                            type: 'success',
                            message: '删除成功!'
                        })
                    })
                }).catch(() => {
                })
            },
            renderContent (h, {node, data, store}) {
                if (this.domainId !== 'default') {
                    return (
                        <span class="custom-tree-node">
                            <span>
                                <i class={'portal-icon-organization_tree theme-color'}></i>
                                <span>{node.label}</span>
                                <span>{data.tag_name ? `（${data.tag_name}）` : ''}</span>
                            </span>
                        </span>
                    )
                }
                
                //根节点现也可以删除
                return (
                    <span class="custom-tree-node">
                        <span>
                            <i class={'portal-icon-organization_tree theme-color'}></i>
                            <span>{node.label}</span>
                            <span>{data.tag_name ? `（${data.tag_name}）` : ''}</span>
                        </span>
                        <span class="icon">
                            <i v-btn-privilege={'org_add'} class="portal-icon-add tree-btns theme-color"
                               type="text" title="添加"
                               on-click={() => this.append(data)}></i>
                            <i v-btn-privilege={'org_modify'} class="portal-icon-edit tree-btns theme-color"
                               type="text" title="编辑"
                               on-click={() => this.update(node, data)}></i>
                            <span v-btn-privilege={'org_delete'}>
                                <i v-show={node.isLeaf} class="portal-icon-delete tree-btns theme-color"
                               type="text" title="删除"
                               on-click={() => this.remove(node, data)}></i>
                            </span>
                            
                        </span>
                    </span>
                )
            },
            closeModal () {
                this.modalVisible = false
            },
            searchOrgTree () {
                let parentId = ''
                OrgApi.getOrgByParent(parentId, this.projectId).then(res => {
                    this.OrgTreeData = res.orgs
                })
            },
            getOrg (node, resolve) {
                let parentId
                if (node && node.level > 0) {
                    parentId = node.data.id
                }
                OrgApi.getOrgByParent(parentId, this.projectId).then(res => {
                    this.orgRequested = true

                    if (node.level === 0 && !res.orgs.length) {
                        // 第一层是否有节点
                        this.orgHasNode = false
                    }
                    resolve(res.orgs)
                })
            },
            queryOrg () {
                if (this.filterText === '') {
                    //
                    this.clearSearch()
                } else {
                    OrgApi.queryOrgByNameOrId({
                        org_name: this.filterText,
                        project_id: this.projectId
                    }).then(res => {
                        this.searchTree = res.org_info
                        this.customSearching = true
                    })
                }
            },

            clearSearch () {
                this.customSearching = false
            },

            refreshOrgTree () {
                this.treeKeyIndex++
            },
            /**
             * @description 同步组织机构
             */
            syncOrg () {
                this.$prompt('', '填写同步参数', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^.+$/,
                    inputErrorMessage: '同步参数不能为空',
                    inputPlaceholder: 'OU=研发中心,DC=example,DC=com',
                    inputValue: this.base_dn
                }).then(({value}) => {
                    const params = {base_dn: value}
                    OrgApi.syncOrg(params).then(res => {
                        // # sync_status 0 同步失败 # sync_status 1 同步成功 # sync_status 2 同步中
                        // let msgs = ['组织机构同步失败', '组织机构同步成功', '组织机构同步中']
                        let message = res.sync_status || ''
                        this.$notify({
                            type: 'success',
                            message
                        })

                        this.refreshOrgTree()
                        // UCMP3-5665 同步用户、同步组织机构输入框需要记录用户上一次手动输入的数据，而不是自动同步时填写的basedn
                        this.getBaseDn()
                        this.subscribe()
                    })
                }).catch(() => {
                })
            },
            //websocket订阅当前服务的状态
            subscribe () {
                if (!window.websocketClient) { window.websocketClient = initWebSocket({token: localStorage.getItem('authenticationToken'), disableDebug: process.env.NODE_ENV === 'development'}) }
                
                // websocket 观察对象函数
                const subscribeEvent = () => {
                    return window.websocketClient.subscribe('/user/queue/guardian.sync.org', d => {
                        if (d && d.body && d.body === 'Org sync finished.') { 
                            this.$notify({
                                type: 'success',
                                message: '组织机构同步已完成'
                            })
                            this.refreshOrgTree()
                            this.unsubscribe()
                        }
                    })
                }
                window.websocketClient.onConnect = () => {
                    // UCMP3-5805 特殊场景需要重新连接时，能主动观察当前服务的状态
                    this.subscribeInstance = subscribeEvent()
                }
                // UCMP3-5805 如果当前是连接状态，直接观察
                if (window.websocketClient.connected) { this.subscribeInstance = subscribeEvent() }
            },

            // UCMP3-5804 websocket取消订阅事件
            unsubscribe () {
                if (this.subscribeInstance && this.subscribeInstance.unsubscribe) { this.subscribeInstance.unsubscribe() }
            },
            /**
             * @description 获取组织同步机构的信息
             */
            getBaseDn () {
                OrgApi.getBaseDn('org').then(res => {
                    this.base_dn = res.base_dn
                })
            }
        },
        destroyed () {
            this.unsubscribe()
        },
        created () {
            this.getBaseDn()
        },
        components: {
            AddFolder
        }
    }
</script>
<style lang="scss" scoped>
    .bind-flag {
        float: right;
    }
    .tree-container {
        height: calc(100% - 36px);
        .filter-container {
            height: 100%;
            overflow: auto;
            padding-bottom: 20px;

            .el-tree {
                padding-top: 20px;
            }
        }
    }

    .tree-btns {
        margin-right: 10px;
    }
</style>

<style lang="scss">
    .organization {
        .icon {
            padding-left: 10px;
        }

        .portal-icon-organization_tree {
            margin-right: 6px;
        }

        .root-add {
            margin: 10px 0 0 24px;
        }

        .tree-btns {
            font-family: 'iconfont-portal' !important;
            font-size: 16px;
            color: #409EFF;
            cursor: pointer;
            margin-right: 5px;
        }

        .el-tree-node__expand-icon {
            font-size: 16px;
        }

        .custom-tree-node {
            flex: 1;
            display: flex;
            align-items: center;

            span:first-child {
                width: 830px;
            }
        }
    }
</style>
