<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal" width="550px")
        el-form(size="small" label-width="60px" label-position="right" :model="model" :rules="rules" ref="tenantForm")
            el-form-item(label="名称" prop="name")
                el-input(v-model.trim="model.name" :maxlength="20" placeholder="请输入租户名称，至少两位")
            el-form-item(label="描述")
                el-input(v-model.trim="model.description" :maxlength="200" placeholder="请输入描述")
        div.dialog-footer(slot="footer")
            el-button(size="mini" @click="closeModal") 取消
            el-button(size="mini" @click="save" type="primary" :loading="isSaving") 保存
</template>

<script>
    /**
     * @description 修改租户信息
     */
    import TenantApi from '@api/axios.tenant'
    import {mapGetters} from 'vuex'

    export default {
        name: 'EditTenant',
        props: ['isEdit', 'visible', 'tenant'],
        data () {
            return {
                rules: {
                    name: [
                        {required: true, message: '请输入租户名称', trigger: 'blur'},
                        {min: 2, message: '请输入至少两位字符', trigger: 'blur'},
                        {validator: this.checkName, trigger: 'blur'}
                    ]
                },
                isSaving: false,
                model: {},
                originName: ''
            }
        },
        created () {
            // UCMP3-1218 租户管理页面，创建和修改租户功能不成功
            this.model = Object.assign({}, this.tenant)
            this.originName = this.model.name
        },
        computed: {
            title () {
                return this.isEdit ? `编辑租户【${this.originName}】` : '增加租户'
            },
            ...mapGetters([
                'tenantList'
            ])
        },
        methods: {
            /**
             * 关闭模态框
             * */
            closeModal () {
                this.$emit('closeDialog')
            },
            save () {
                this.isSaving = true
                this.$refs.tenantForm.validate((valid) => {
                    if (valid) {
                        // 修改
                        if (this.isEdit) {
                            TenantApi.updateTenant({
                                project_id: this.model.id,
                                name: this.model.name,
                                description: this.model.description || '',
                                enabled: this.tenant.enabled
                            }).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: this.title + '成功'
                                })

                                this.isSaving = false
                                this.$emit('updateTenant')
                            }).catch(error => {
                                console.log(error)
                                this.isSaving = false
                            })
                        } else {
                            // 新增
                            TenantApi.createTenant({
                                name: this.model.name,
                                description: this.model.description || ''
                            }).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: '成功创建租户' + this.model.name
                                })

                                this.isSaving = false
                                this.$emit('updateTenant')
                            }).catch(error => {
                                console.log(error)
                                this.isSaving = false
                            })
                        }
                    } else this.isSaving = false
                })
            },
            /**
             * @ 判断租户名称是否重复及是否符合格式
             * @param rule
             * @param value
             * @param cb
             */
            checkName (rule, value, cb) {
                const getOne = this.tenantList.find(item => {
                    // UMCP-713 【租户管理】租户列表，已存在ddd124租户，创建DDD124租户，提示操作冲突
                    // keystone 大小写不敏感
                    if (this.isEdit) return value !== this.originName && item.name.toLowerCase() === value.toLowerCase()
                    else return item.name.toLowerCase() === value.toLowerCase()
                })

                const regex = /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5\w]+$/
                if (!regex.test(value)) {
                    cb(new Error('由至少两位的汉字，英文字母，数字和下划线组成，首字母为汉字或字母'))
                } else if (getOne) {
                    cb(new Error('租户名称不能重复,英文字母不区分大小写'))
                } else cb()
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
