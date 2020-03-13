<template lang="pug">
    el-form.normal-form-width(ref="normalForm" :model="normalForm" :rules="rules" label-width="140px")
        el-form-item(label="AppId" prop="account_id")
            el-input(v-model="normalForm.account_id" size="small" placeholder="请输入APPID" :maxlength="256")
        el-form-item(label="Token" prop="account_token")
            el-input(v-model="normalForm.account_token" size="small" placeholder="请输入Token" :maxlength="256")
        el-form-item(label="SMS服务器" prop="server_addr")
            el-input(v-model="normalForm.server_addr" size="small" placeholder="请输入SMS服务器" :maxlength="256")
        el-form-item(label="端口" prop="server_port")
            el-input(v-model="normalForm.server_port" size="small" placeholder="请输入端口号")
        el-form-item(label="输入测试手机" prop="test_phone")
            el-input(v-model="normalForm.test_phone" size="small" placeholder="请输入手机号码")
        el-form-item(v-if="normalForm.extra_params.length" v-for="param in normalForm.extra_params" :label="param.key" :prop="param.key" :key="param.key")
            el-input.custom-item(v-model="param.value" size="small" :placeholder="'请输入 '+param.key" :maxlength="256")
            el-tooltip(content="删除该自定义参数" effect="dark" placement="right" )
                el-button.margin-left(size="small" icon="el-icon-delete" circle @click="deleteCustomParam(param)")
        el-form-item
            el-button(type="default" size="small" round icon="el-icon-plus" @click="addNewParam()") 新增自定义参数
        el-form-item
            el-button(v-btn-privilege="'sys_msm_save'" @click="submitForm" type="primary" size="small" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 消息中心 ==> 短信配置
     */

    import ValidationRules from '@mixins/validationRules'
    import ConfigApi from '@api/axios.configuration'
    export default {
        mixins: [ValidationRules],
        data () {
            return {
                normalForm: {
                    id: '',
                    server_addr: '',
                    project_id: localStorage.getItem('tenant'),
                    server_port: '',
                    account_id: '',
                    account_token: '',
                    test_phone: '',
                    extra_params: [] // 自定义参数集合
                },
                rules: {
                    account_id: [
                        {required: true, message: '请输入APPID', trigger: 'blur'}
                    ],
                    account_token: [
                        {required: true, message: '请输入Token', trigger: 'blur'}
                    ],
                    server_addr: [
                        {required: true, message: '请输入SMS服务器', trigger: 'blur'}
                    ],
                    server_port: [
                        {required: true, message: '请输入端口号', trigger: 'blur'},
                        {validator: this.portCheck, trigger: 'blur'}
                    ],
                    test_phone: [
                        {required: true, message: '请输入手机号码', trigger: 'blur'},
                        {validator: this.validationPhoneNumber, trigger: 'blur'}
                    ]
                },
                isSaving: false
            }
        },
        created () {
            ConfigApi.getNoteConf().then(res => {
                this.normalForm = res
            })
        },
        computed: {
        },
        methods: {
            // 保存短信配置
            submitForm () {
                this.$refs.normalForm.validate().then(res => {
                    if (res) {
                        this.isSaving = true
                        ConfigApi.updateNoteConf(this.normalForm).then(res => {
                            this.isSaving = false
                            this.$notify.success('短信配置保存成功')
                        }, () => {
                            this.isSaving = false
                            this.$notify.error('短信配置保存失败')
                        })
                    }
                }, () => {
                })
            },

            // 添加自定义参数
            addNewParam () {
                this.$prompt('请输入参数名', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^[A-Za-z0-9\u4e00-\u9fa5_]{1,10}$/,
                    inputErrorMessage: '请输入正确的参数格式， 由字母、数字、下划线组成，字符长度最大为10'
                }).then(({value}) => {
                    let findParam = this.normalForm.extra_params.find(item => item.key === value)
                    if (!findParam && !this.normalForm.hasOwnProperty(value)) {
                        this.normalForm.extra_params.push({
                            key: value,
                            value: ''
                        })
                    } else {
                        this.$message.error('该参数已存在')
                    }
                }).catch(() => {
                })
            },

            // 删除自定义参数
            deleteCustomParam (val) {
                this.normalForm.extra_params = this.normalForm.extra_params.filter(item => item !== val)
            }
        }
    }
</script>
<style lang="scss" scoped>
    .normal-form-width {
        width: 500px;
    }

    .custom-item {
        width: calc(100% - 70px);
    }
</style>
