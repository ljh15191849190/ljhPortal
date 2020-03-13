<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal")
        el-form(size="small" label-width="120px" label-position="right" :model="businessForm" :rules="bus_rules" ref="businessForm")
            el-form-item(:label="`${IsBussiness}名称`" prop="name")
                el-input(v-model.trim="businessForm.name" :maxlength="50" :placeholder="`请输入${IsBussiness}名称`")
            el-form-item(label="描述")
                el-input(v-model.trim="businessForm.description" :maxlength="200" placeholder="请输入描述内容")
            el-form-item(label="组织机构" prop="organization")
                <!--el-cascader(v-model="businessForm.org_array" :disabled="isEdit" change-on-select :options="organizations" :props="{value: '_id',label: '_org_name', children: '_subOrgs'}")-->
                SearchInputOrganization.normal-form-select-width(
                v-model="businessForm.organization"
                :defaultOrg="defaultOrg")
        div.dialog-footer(slot="footer")
            el-button(size="mini" @click="closeModal") 取消
            el-button(size="mini" @click="save" type="primary" :loading="isSaving") 保存
</template>

<script>
    /**
     * @description 修改/新增 业务
     */
    import BusinessApi from '@api/axios.business'
    import OrgApi from '@api/axios.organization'
    import SearchInputOrganization from '@lib/SearchInputOrganization'
    import {mapGetters} from 'vuex'
    export default {
        name: 'EditBusiness',
        components: {SearchInputOrganization},
        props: ['isEdit', 'data', 'visible'],
        data () {
            return {
                originName: this.data ? this.data.name : '',
                isSaving: false,
                businessForm: {
                    id: '',
                    name: '',
                    description: '',
                    organization: ''
                },
                defaultOrg: [],
                projectId: localStorage.getItem('tenant')
            }
        },
        computed: {
            bus_rules () {
                return {
                    name: [
                        {required: true, message: `请输入${this.IsBussiness}名称`, trigger: 'blur'},
                        {validator: this.checkName, trigger: 'blur'}
                    ],
                    organization: [
                        {required: true, message: '请选择组织机构', trigger: 'change'}
                    ]
                }
            },
            title () {
                return this.isEdit ? `修改${this.IsBussiness}【${this.originName}】` : `创建${this.IsBussiness}`
            },
            IsBussiness () {
                return this.businessOrproject === 'business' ? '业务' : '项目'
            },
            ...mapGetters(['businessOrproject'])
        },
        methods: {
            /**
             * @description 关闭模态框
             * */
            closeModal () {
                this.$emit('closeDialog')
            },
            /**
             * @description 保存或修改
             */
            save () {
                this.isSaving = true
                this.$refs.businessForm.validate(valid => {
                    if (valid) {
                        let payload = {
                            name: this.businessForm.name,
                            description: this.businessForm.description,
                            project_id: this.projectId,
                            org_id: this.businessForm.organization.org_id,
                            org_array: this.businessForm.organization.org_array,
                            sortby: 0,
                            enable: 1
                        }

                        if (this.businessForm.id) {
                            payload.id = this.businessForm.id
                        }

                        BusinessApi.createOrUpdateBusiness(payload).then(res => {
                            this.$notify({
                                type: 'success',
                                message: this.title + '成功'
                            })

                            this.isSaving = false
                            this.$emit('update')
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else {
                        this.isSaving = false
                    }
                })
            },
            checkName (rule, value, cb) {
                if (value !== this.originName) {
                    BusinessApi.checkBusinessName(value).then(res => {
                        if (res.id) {
                            cb(new Error('业务名称不能重复'))
                        } else cb()
                    })
                } else cb()
            },
            queryUserOrgById (orgId) {
                OrgApi.queryOrgByNameOrId({
                    org_id: orgId,
                    project_id: this.projectId
                }).then(res => {
                    this.defaultOrg = res.org_info
                })
            }
        },
        created () {
            if (this.isEdit) {
                this.businessForm = {
                    name: this.data.name,
                    description: this.data.description,
                    organization: {
                        org_id: this.data.org_id,
                        org_array: this.data.org_array
                    },
                    id: this.data.id
                }
                this.queryUserOrgById(this.data.org_id)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
