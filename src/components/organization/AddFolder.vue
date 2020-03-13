<template lang="pug">
    el-dialog(:title="title"
    width="600px"
    :visible.sync="visible"
    :before-close="handleClose")
        el-form(:model="folderForm" ref="folderForm" label-width="120px" size="small")
            el-form-item.rw-input.is-required(v-if="checkedNode==='bindflag'" label="选择组织机构" prop="org_names" :rules="[{ required: true, message: '组织机构名称不能为空', trigger: 'change'}]")
                OrgTree.form-width(
                        v-if="orgList.length"
                        v-model="folderForm.org_names"
                        :name="'org_ids'"
                        :placeholder="'请选择组织机构'"
                        data-vv-as="组织机构名称"
                        :isDanger="folderForm.org_ids"
                        :defaultProps="defaultProps"
                        :treeData="orgList"
                        :selectNodes.sync="folderForm.org_ids"
                    )
            el-form-item(v-else label="组织机构名称" prop="org_names" :rules="[{ required: true, message: '组织机构名称不能为空', trigger: 'blur'}, {validator: isExistOrgName, trigger: 'blur'}]")
                el-input(v-model="folderForm.org_names" :maxlength="50" v-loading="loading" placeholder="请输入组织机构名称")
            el-form-item(label="选择标识" prop="tag_id")
                el-select.normal-form-select-width(v-model="folderForm.tag_id")
                    el-option(v-for="item in appTags" :label="item.name" :key="item.id" :value="item.id")
        div.dialog-footer(slot="footer")
            el-button(@click="handleClose()") 取消
            el-button(@click="submitForm" type="primary" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 添加组织机构组件
     * @author davidPan
     *
     * 创建，检查根节点需要parentId传空
     */
    import OrgApi from '@api/axios.organization'
    import Api from '@api/axios.configuration'
    import OrgTree from '@lib/OrgTree'
    export default {
        props: ['visible', 'checkedNode', 'add'],
        components: {
            OrgTree
        },
        data () {
            return {
                loading: false,
                isSaving: false,
                folderForm: {
                    org_ids: [],
                    org_names: '',
                    tag_id: ''
                },
                appTag: [],
                orgList: [],
                defaultProps: {
                    id: 'id',
                    node_id: 'node_id',
                    parentId: 'parent_id',
                    children: 'sub_orgs',
                    label: 'org_name'
                },
                originName: this.add === 1 ? '' : this.checkedNode.org_name,
                rules: {
                    org_names: [
                        {required: true, message: '请输入组织机构名称', trigger: 'blur'},
                        {validator: this.isExistOrgName, trigger: 'blur'}
                    ]
                }
            }
        },
        watch: {
            // 'folderForm.org_names' () {
            //     if (this.add === 0 && this.checkedNode.id) {
            //         this.getOrgtagList(this.checkedNode.id)
            //     }
            // }
        },
        computed: {
            appTags () {
                this.appTag.push({id: '', name: '无'})
                return this.appTag
            },
            title () {
                const configIcon = {
                    0: '绑定标识',
                    1: '添加组织机构',
                    2: `修改组织机构【${this.originName}】`
                }
                return configIcon[this.add]
                // return this.add === 1 ? '添加组织机构' : `修改组织机构【${this.originName}】`
            }
        },
        methods: {
            handleClose () {
                this.$emit('closeDialog')
            },
            // 校验组织机构是否存在
            isExistOrgName (rule, value, callback) {
                //原子作业平台ATOMFLOWAT-178(创建组织机构的时候，输入相同的名称，没有做校验)
                this.loading = true

                const regex = /^[\u4e00-\u9fa5\w\-]+$/
                if (!regex.test(value)) {
                    this.loading = false
                    callback(new Error('由汉字或英文字母或数字或下划线或连词符组成'))
                } else if (value !== this.originName) {
                    // UCMP-715【组织机构】组织机构界面，修改组织机构名称时没做重复校验
                    // 组件this.checkedNode是当前选中节点，新增的时候自己是作为父节点用自己的id，修改的时候应查找父节点id
                    const parentId = this.add === 1 ? this.checkedNode.id : this.checkedNode.parent_id
                    const projectId = localStorage.getItem('tenant')

                    // 检查根节点需要parentId传空
                    OrgApi.checkOrgName(this.folderForm.org_names, projectId, parentId || '').then(res => {
                        this.loading = false
                        if (res.code === 1) {
                            callback(new Error('该组织机构名称已经存在，请重新输入!'))
                        } else {
                            callback()
                        }
                    }, err => {
                        console.log(err)
                        this.loading = false
                    })
                } else {
                    this.loading = false
                    callback()
                }
            },
            submitForm () {
                this.isSaving = true
                this.$refs.folderForm.validate((valid) => {
                    if (valid) {
                        // 新增
                        if (this.add === 1) {
                            let payload = {
                                org_name: this.folderForm.org_names,
                                parent_id: this.checkedNode.id || '',
                                tag_ids: this.folderForm.tag_id !== '' ? this.folderForm.tag_id.split(',') : []
                            }
                            OrgApi.createOrg(payload).then(res => {
                                this.$emit('insertNode', {
                                    id: res.id,
                                    org_name: this.folderForm.org_names,
                                    parent_id: this.checkedNode.id,
                                    tag_ids: this.folderForm.tag_id.split(',')
                                })
                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '添加组织机构成功'
                                })

                                this.isSaving = false
                            }).catch(e => {
                                this.isSaving = false
                            })
                        } else if (this.add === 0) {
                            // 绑定标识
                            let arr = []
                            if (this.folderForm.org_ids && this.folderForm.org_ids.length > 0) {
                                this.folderForm.org_ids.map(item => {
                                    let payload = {}
                                    payload.node_id = item
                                    payload.tag_ids = this.folderForm.tag_id !== '' ? this.folderForm.tag_id.split(',') : []
                                    arr.push(payload)
                                })
                            }
                            console.log(arr)
                            OrgApi.BindingOrg(arr).then((data) => {
                                this.$emit('insertNode', this.checkedNode)

                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '绑定组织机构成功'
                                })
                                this.isSaving = false
                            }).catch(e => {
                                this.isSaving = false
                            })
                        } else {
                            // 修改
                            let payload = {
                                id: this.checkedNode.id,
                                org_name: this.folderForm.org_names,
                                tag_ids: this.folderForm.tag_id !== '' ? this.folderForm.tag_id.split(',') : []
                            }

                            OrgApi.updateOrg(payload).then((data) => {
                                let checkedNode = JSON.parse(JSON.stringify(this.checkedNode))
                                checkedNode.org_name = this.folderForm.org_names
                                this.$emit('insertNode', checkedNode)

                                this.$notify({
                                    title: '通知',
                                    type: 'success',
                                    message: '更新组织机构成功'
                                })
                                this.isSaving = false
                            }).catch(e => {
                                this.isSaving = false
                            })
                        }
                    } else this.isSaving = false // 验证未通过
                })
            },
            getOrgList () {
                Api.getOrgList().then(res => {
                    if (res && res.tags) {
                        this.appTag = res.tags
                    }
                })
            },
            getAppOrgTree () {
                OrgApi.getOrgTree().then(res => {
                    this.orgList = res
                })
            },
            getOrgtagList (data) {
                let payload = {
                    org_id: data
                }
                OrgApi.getOrgtag(payload).then(res => {
                    if (res && res.tag_ids) {
                        this.folderForm.tag_id = res.tag_ids.join(',')
                    }
                })
            }
        },
        created () {
            this.folderForm.org_names = this.add === 1 ? '' : this.checkedNode.org_name
            this.getOrgList() //标识
            this.getAppOrgTree() //全部树
            if (this.add === 2) {
                let checkedNode = this.checkedNode.id
                this.getOrgtagList(checkedNode) //修改赋值
            }
        }
    }
</script>
<style lang="scss" scoped>

</style>
