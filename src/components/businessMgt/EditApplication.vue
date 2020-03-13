<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal")
        el-form(size="small" label-width="80px" label-position="right" :model="appForm" :rules="rules" ref="appForm")
            el-form-item.is-required(label="应用名称" prop="business_app_name")
                el-input(v-model.trim="appForm.business_app_name" :maxlength="50" placeholder="请输入应用名称")
            el-form-item.is-required(label="应用简称" prop="shorter_name")
                el-input(v-model.trim="appForm.shorter_name" :maxlength="20" placeholder="请输入应用简称")
            el-form-item(label="描述" prop="description")
                el-input(v-model.trim="appForm.description" :maxlength="200" placeholder="请输入描述")
        div.dialog-footer(slot="footer")
            el-button(size="mini" @click="closeModal") 取消
            el-button(size="mini" @click="save" type="primary" :loading="isSaving") 保存 
</template>

<script>
    /**
     * @description 修改/增加 应用
     */
    import api from '@api/axios.business'

    export default {
        name: 'EditApplication',
        props: ['isEdit', 'appData', 'visible', 'businessId'],
        data () {
            return {
                rules: {
                    business_app_name: [
                        {required: true, message: '请输入应用名称', trigger: 'blur'},
                        {validator: this.checkName, trigger: 'blur'}
                    ],
                    shorter_name: [
                        {required: true, message: '请输入应用简称', trigger: 'blur'},
                        {
                            pattern: /^[0-9a-zA-Z][\w\-]*$/,
                            message: '支持字母、数字、下划线、连字符组成，以字母或者数字开头',
                            trigger: ['blur', 'change']
                        }
                    ]
                },
                appForm: {},
                isSaving: false,
                projectId: localStorage.getItem('tenant')
            }
        },
        computed: {
            title () {
                return this.isEdit ? `修改应用【${this.originName}】` : '创建应用'
            },
            originName () {
                return this.appData ? this.appData.app_name : ''
            }
        },
        methods: {
            closeModal () {
                this.$emit('close')
            },
            save () {
                this.isSaving = true
                this.$refs.appForm.validate(valid => {
                    if (valid) {
                        let data = {
                            business_app_name: this.appForm.business_app_name,
                            shorter_name: this.appForm.shorter_name,
                            description: this.appForm.description || '',
                            business_id: this.businessId,
                            project_id: this.projectId,
                            enable: 1
                        }

                        if (this.isEdit) data.id = this.appForm.id
                        api.createOrUpdateApp(data).then(res => {
                            this.$notify({
                                type: 'success',
                                message: this.title + '成功'
                            })

                            this.isSaving = false
                            this.$emit('updateApp')
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else this.isSaving = false
                })
            },
            checkName (rule, value, cb) {
                if (value !== this.originName) {
                    api.checkAppName(value).then(res => {
                        if (res.id) cb(new Error('应用名称不能重复'))
                        else cb()
                    })
                } else cb()
            },
            initAppForm (data) {
                return {
                    id: data.id,
                    business_app_name: data.app_name,
                    shorter_name: data.short,
                    description: data.description,
                    enable: data.enable
                }
            }
        },
        created () {
            if (this.isEdit) this.appForm = this.initAppForm(this.appData)
        }

    }
</script>

<style lang="scss" scoped>

</style>