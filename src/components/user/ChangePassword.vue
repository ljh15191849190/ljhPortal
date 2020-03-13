<template lang="pug">
    div.portal-non-left-nav
        div.title.flex-between
            span 修改密码
        div.content
            el-form.form-width(size="small" label-position="right" label-width="120px" :model="psdForm" ref="psdForm" :rules="rules")
                el-form-item(label="旧密码" prop="original_password")
                    el-input(clearable v-model="psdForm.original_password" type="password" placeholder="请输入旧登录密码")
                el-form-item(label="新密码" prop="password")
                    el-input(clearable v-model="psdForm.password" type="password" placeholder="请输入新登录密码")
                el-form-item(label="重复新密码" prop="repeat_password")
                    el-input(clearable v-model="psdForm.repeat_password" type="password" placeholder="请再次输入新登录密码")
                el-form-item
                    el-button(type="primary" @click="save") 保存
</template>

<script>
    /**
     * @description 首次修改密码
     */
    import api from '@api/axios.users'
    export default {
        name: 'ChangePassword',
        data () {
            return {
                psdForm: {},
                rules: {
                    original_password: [
                        {required: true, message: '请输入旧登录密码', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入新登录密码', trigger: 'blur'},
                        {validator: this.isOldPassword, trigger: 'blur'},
                        {validator: this.checkPasswordStronger, trigger: 'blur'}
                    ],
                    repeat_password: [
                        {
                            required: true,
                            message: '请再次输入新登录密码',
                            trigger: 'blur'
                        },
                        {validator: this.isFitPassword, trigger: 'blur'},
                        {validator: this.checkPasswordStronger, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            save () {
                this.$refs.psdForm.validate(valid => {
                    if (valid) {
                        const user = {
                            new_passwd: this.psdForm.password,
                            original_passwd: this.psdForm.original_password
                        }
                        api.changeUserPassword(user).then(res => {
                            if (res.code === 0) {
                                this.$notify({
                                    type: 'warning',
                                    message: '旧密码输入错误'
                                })
                            } else {
                                this.$notify({
                                    type: 'success',
                                    message: '修改成功，请重新登录'
                                })

                                setTimeout(() => {
                                    this.$router.push('/login')
                                }, 3000)
                            }
                        })
                    }
                })
            },
            isFitPassword (rule, value, callback) {
                if (value === '') {
                    callback(new Error('请再次输入登录密码'))
                } else if (value !== this.psdForm.password) {
                    callback(new Error('两次输入密码不一致!'))
                } else {
                    callback()
                }
            },
            isOldPassword (rule, value, callback) {
                if (value === this.psdForm.original_password) {
                    callback(new Error('新密码不能和旧密码相同!'))
                } else {
                    callback()
                }
            },
            // 检验是否是强密码
            checkPasswordStronger (rule, value, callback) {
              // UCMP3-6517 密码不得使用登录账号的单词
              const userName = localStorage.getItem('systemUserName')
              if (userName && value.indexOf(userName) >= 0) {
                callback(new Error(`密码中不能包含登录名`))
                return
              }
              api.registerCheckPasswordStronger(value)
              .then(res => {
                if (res.code !== 1) {
                  callback(new Error(`密码验证不符合规则${res.common}`))
                } else {
                  callback()
                }
              })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .form-width {
        max-width: 640px;
    }
</style>
