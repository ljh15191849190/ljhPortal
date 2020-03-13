<template lang="pug">
    el-form.normal-form-width(ref="emailForm" :model="emailForm" :rules="rules" label-width="140px")
        el-form-item(label="邮件服务器" prop="server_addr")
            el-input(v-model="emailForm.server_addr" size="small" placeholder="请输入服务器地址" :maxlength="100")
        el-form-item(label="端口" prop="server_port")
            el-row
                el-col(:span="18")
                    el-input(v-model.number="emailForm.server_port" size="small" :maxlength="10" placeholder="请输入端口号")
                el-col.text-right(:span="6")
                    el-checkbox(v-model="emailForm.is_tls") 是否TLS
        el-form-item(label="邮箱用户名" prop="user_name")
            el-input(v-model="emailForm.user_name" size="small" placeholder="请输入邮箱用户名" :maxlength="100" autocomplete="new-password")
        el-form-item(label="邮箱密码" prop="user_pass")
            el-input(v-model="emailForm.user_pass" size="small" type="password" :placeholder="passplaceholder" :maxlength="100" autocomplete="new-password")
        el-form-item(label="发件人地址" prop="from_user_addr")
            el-input(v-model="emailForm.from_user_addr" size="small" placeholder="请输入发件人邮箱" :maxlength="100")
        el-form-item(label=" 测试邮件地址" prop="test_to_user_addr")
            el-row
                el-col(:span="18")
                    el-input(v-model="emailForm.test_to_user_addr" size="small" placeholder="请输入测试邮箱" :maxlength="100")
                el-col.text-right(:span="6")
                    el-button(@click="testSubmit" size="small" :disabled="disabled") 测试验证
        el-form-item
            el-button(v-btn-privilege="'sys_email_save'" @click="submitForm" type="primary" size="small" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 消息中心 ==> 邮件管理
     */
    import OprApi from '@api/axios.configuration'
    import ValidationRules from '@mixins/validationRules'
    
    export default {
        mixins: [ValidationRules],
        data () {
            return {
                passplaceholder: '******',
                disabled: false,
                emailForm: {
                    id: '',
                    project_id: localStorage.getItem('tenant'),
                    server_addr: '',
                    server_port: '',
                    is_tls: false,
                    user_name: '',
                    user_pass: '',
                    from_user_addr: '',
                    test_to_user_addr: ''
                },
                rules: {
                    server_addr: [
                        {required: true, message: '请输入服务器地址', trigger: 'blur'}
                    ],
                    server_port: [
                        {required: true, message: '请输入端口号', trigger: 'blur'},
                        {validator: this.portCheck, trigger: 'blur'}
                    ],
                    user_name: [
                        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
                        {
                            type: 'email',
                            message: '请输入正确的邮箱地址',
                            trigger: 'blur,change'
                        }
                    ],
                    user_pass: [
                        {required: false, message: '请输入邮箱密码', trigger: 'blur'}
                    ],
                    from_user_addr: [
                        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
                        {
                            type: 'email',
                            message: '请输入正确的邮箱地址',
                            trigger: 'blur,change'
                        }
                    ],
                    test_to_user_addr: [
                        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
                        {
                            type: 'email',
                            message: '请输入正确的邮箱地址',
                            trigger: 'blur,change'
                        }
                    ]
                },
                isSaving: false
            }
        },
        computed: {
        },
        methods: {
            testSubmit () {
                this.isSaving = true
                this.$refs.emailForm.validate((valid) => {
                    if (valid) {
                        this.disabled = true
                        let resData = {...this.emailForm}
                        resData.is_tls = Number(resData.is_tls)
                        OprApi.testSendEmail(resData).then(res => {
                            this.disabled = false

                            // 测试提示用户去邮箱查收邮件
                            this.$alert('邮件已发送，请去测试邮箱中查看是否收到邮件', '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                }
                            })
                            this.isSaving = false
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else this.isSaving = false
                })
            },
            submitForm () {
                this.$refs.emailForm.validate((valid) => {
                    if (valid) {
                        this.isSaving = true
                        let resData = {...this.emailForm}
                        resData.is_tls = Number(resData.is_tls)
                        OprApi.updateEmail(resData).then(res => {
                            this.isSaving = false
                            //创建成功
                            this.$notify({
                                type: 'success',
                                message: '邮箱配置保存成功'
                            })
                        }, () => {
                            this.isSaving = false
                        })
                    }
                })
            }
        },
        created () {
            OprApi.getEmailConfig().then(res => {
                res.is_tls = !!res.is_tls
                this.emailForm = res
                if (!res.id) { // 初始化邮箱配置密码必输
                    this.rules.user_pass[0].required = true
                    this.passplaceholder = '请输入邮箱密码'
                }
            })
        }
    }
</script>
<style lang="scss" scoped>
    .mar-right {
        margin-left: 52px;
    }

    .mar-email-right {
        margin-left: 26px;
    }
</style>
