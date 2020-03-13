<template lang="pug">
    el-form.normal-form-width(ref="organizationForm" :model="organizationForm" class="demo-form-inline" label-width="140px")
        el-row(v-if="organizationForm.extra_params.length" v-for="(param ,index) in organizationForm.extra_params" :key="index")
            el-col(:span="18")
                el-form-item(:label="index===0?'组织机构标识':''" :prop="'extra_params.'+index+'.name'" :rules="[{ required: true, message: '请输入组织机构标识', trigger: 'blur' }, {validator: isExistTags, trigger: 'blur'}]")
                    el-input(v-model="param.name" size="small" placeholder="请输入组织机构标识" :maxlength="20")
            el-col.phonemarginLeft(:span="2")
                el-tooltip(content="新增" effect="dark" placement="right" )
                    el-button(size="small" icon="el-icon-plus" type="primary" circle @click="addNewParam()")
            el-col.phonemarginLeft(:span="2" v-btn-privilege="'org_tag_delete'")
                el-tooltip(content="删除" effect="dark" placement="right" )
                    el-button(size="small" icon="el-icon-minus" type="info" plain circle @click="deleteCustomParam(param)")
        el-row(v-if="organizationForm.extra_params.length===0")
            el-button.buttonsave(icon="el-icon-circle-plus-outline" size="small" type="primary" @click="addNewParam") 添加组织机构标识
        el-button.buttonsave(v-btn-privilege="'org_tag_save'" @click="submitForm" type="primary" :loading="isSaving" size="small") 保存
</template>
<script>
/**
 * @description 
 */

import ValidationRules from '@mixins/validationRules'
import Api from '@api/axios.configuration'
export default {
    mixins: [ValidationRules],
    data () {
        return {
            organizationForm: {
                extra_params: [
                    {
                        name: ''
                    }
                ] // 自定义参数
            },
            isSaving: false,
            project_id: localStorage.getItem('tenant')
        }
    },
    created () {
        this.queryList()
    },
    computed: {},
    methods: {
        queryList () {
            Api.getOrgList().then(res => {
                if (res && res.tags) {
                    this.organizationForm.extra_params = res.tags
                }
            })
        },
        // 保存
        submitForm () {
            this.isSaving = true
            this.$refs.organizationForm.validate().then(res => {
                if (res) {
                    let data = this.organizationForm.extra_params
                    if (data && data.length > 0) {
                        Api.saveOrg(data).then(res => {
                            this.$notify.success('保存成功')
                            this.queryList()
                            this.isSaving = false
                            // this.organizationForm.extra_params.forEach(item => delete item.saveflag)
                        }, () => {
                            this.$notify.error('保存失败')
                            this.isSaving = false
                        }).catch(e => {
                            this.isSaving = false
                        })
                    }
                }
            })
        },
        // 添加
        addNewParam () {
            if (this.organizationForm.extra_params) {
                this.organizationForm.extra_params.push({
                    name: ''
                })
            }
        },

        // 删除
        deleteCustomParam (val) {
            let data = val.id
            if (data) {
                Api.deleteOrg(val).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '删除成功'
                    })
                    this.queryList()
                }, () => {
                    this.$notify.error('删除失败')
                })
            } else {
                this.organizationForm.extra_params = this.organizationForm.extra_params.filter(item => item !== val)
            }
        },
        isExistTags (rule, value, callback) {
            // 验证
            const regex = /^[a-zA-Z0-9-_\u4e00-\u9fa5]*$/
            if (!regex.test(value)) {
                return callback(new Error('由汉字、数字、英文字母、中划线或下划线组成'))
            }
            callback()
        }

    }
}
</script>
<style lang="scss" scoped>
.normal-form-width {
  width: 600px;
}
.buttonsave{
    margin-left: 140px;
}
.phonemarginLeft{
    margin-left:10px
}
</style>
