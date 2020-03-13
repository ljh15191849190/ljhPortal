<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item(:to="{ path: '/content/system/user' }") 用户管理
            el-breadcrumb-item {{pageTitle}}
        el-row.portal-content
            el-form.normal-form-width(ref="userForm" :model="userForm" :rules="rules" label-width="120px" size="small" :disabled="!isAddType")
                el-form-item(label="登录名" prop="name")
                    el-input(v-model.trim="userForm.name" v-loading="loading" :maxlength="20" placeholder="请输入登录名，至少2位" autocomplete="new-password")
                el-form-item(v-if="isAddType" label="密码" prop="password")
                    el-input(v-model="userForm.password" type="password" :maxlength="20" placeholder="请输入密码" autocomplete="new-password")
                el-form-item(v-if="userForm.password" label="确认密码" prop="re_password")
                    el-input(v-model="userForm.re_password" type="password" :maxlength="20" placeholder="请再次输入密码" autocomplete="new-password")
                el-form-item(v-if="isLocalDomain" label="租户" prop="default_project_id")
                    el-select.normal-form-select-width(v-model="userForm.default_project_id" placeholder="请选择租户" @change="tenantChange")
                        el-option(v-for="item in tenantList" v-if="item.enabled" :key="item.id" :label="item.name" :value="item.id")
                el-form-item(label="组织机构" prop="organization")
                    SearchInputOrganization.normal-form-select-width(
                    v-model="userForm.organization"
                    :defaultOrg="defaultOrg"
                    :projectId="userForm.default_project_id"
                    :disabled="!isAddType")
                    el-tooltip(content="组织机构列表需先选择租户")
                        i.theme-color.el-icon-question.margin-left
                el-form-item(label="姓名" prop="realname")
                    el-input(v-model.trim="userForm.realname" :maxlength="20" placeholder="请输入姓名")
                el-form-item(label="邮箱" prop="email")
                    el-input(v-model.trim="userForm.email" :maxlength="100" placeholder="请输入邮箱")

                el-form-item(label="腾讯通号" prop="rtx")
                    el-input(v-model.trim="userForm.rtx"  placeholder="请输入腾讯通号")
                el-form-item(label="电话号码" prop="tel")
                    el-input(v-model.trim="userForm.tel" :maxlength="20" placeholder="请输入电话号码，可以用-连接，至少7位")
                el-form-item(label="手机号码" prop="phone")
                    el-input(v-model.trim="userForm.phone" :maxlength="20" placeholder="请输入11位手机号码")
                el-form-item(label="备注" prop="comments")
                    el-input(v-model="userForm.comments" type="textarea" :maxlength="250" placeholder="请输入备注，250字符以内")
                el-form-item(v-if="isLocalDomain" label="是否启用" prop="enabled")
                    el-radio-group(v-model="userForm.enabled")
                        el-radio(:label="item.value" v-for="item in enables" :key="item.id" ) {{item.name}}
            div.btn-footer
                el-button(size="mini" @click="reset" :disabled="false") 返回
                el-button(v-if="isAddType" size="mini" @click="submit" type="primary" :disabled="disableSubmit" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 用户管理 - 新增/查看
     */
    import UserApi from '@api/axios.users'
    import OrgApi from '@api/axios.organization'
    import SearchInputOrganization from '@lib/SearchInputOrganization'
    // import {mapGetters} from 'vuex'

    export default {
        data () {
            return {
                userForm: {
                    id: '',
                    name: '',
                    realname: '',
                    password: '',
                    re_password: '',
                    default_project_id: '',
                    tel: '',
                    phone: '',
                    email: '',
                    organization: null,
                    enabled: 1,
                    comments: '',
                    rtx: '' //腾讯通号
                },
                isSaving: false,
                loading: false,
                copiedName: '',
                enables: [
                    {id: 'enable', name: '启用', value: 1},
                    {id: 'disable', name: '禁用', value: 0}
                ],
                disableSubmit: false,
                organizations: [],
                defaultOrg: [],
                rules: {
                    name: [
                        {required: true, message: '请输入登录名', trigger: 'blur'},
                        {min: 2, message: '请输入至少两位字符', trigger: 'blur'},
                        {validator: this.ifUserNameExist, trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入登录密码', trigger: 'blur'},
                        {validator: this.checkPasswordStronger, trigger: 'blur'}
                    ],
                    default_project_id: [
                        {required: true, message: '请选择租户', trigger: 'blur'}
                    ],
                    re_password: [
                        {required: true, message: '请再次输入登录密码', trigger: 'blur'},
                        {validator: this.isFitPassword, trigger: 'blur'},
                        {validator: this.checkPasswordStronger, trigger: 'blur'}
                    ],
                    realname: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                    tel: [
                        {
                            pattern: /^[-\d]{7,14}$/,
                            message: '请按照正确电话格式输入，可以用-连接，至少7位',
                            trigger: 'blur'
                        }
                    ],
                    phone: [
                        {required: true, message: '请输入手机号码', trigger: 'blur'},
                        {
                            pattern: /^1[345789]\d{9}/g,
                            message: '请按照正确手机格式输入',
                            trigger: 'blur'
                        }
                    ],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: this.ifEmailExist, trigger: 'blur'}
                    ],
                    organization: [
                        {required: true, message: '请选择组织机构', trigger: 'change'}
                    ],
                    enabled: [],
                    rtx: []
                },
                tenantList: []
            }
        },
        computed: {
            isLocalDomain () {
                return localStorage.getItem('domainId') === 'default'
            },
            pageTitle () {
                return this.isAddType ? '创建用户' : '查看用户'
            },
            isAddType () {
                return this.$route.params.id === 'add'
            }
        },
        methods: {
            /**
             * @description 校验两次输入密码是否一致
             */
            isFitPassword (rule, value, callback) {
                if (value === '') {
                    callback(new Error('请再次输入登录密码'))
                } else if (value !== this.userForm.password) {
                    callback(new Error('两次输入密码不一致!'))
                } else {
                    callback()
                }
            },
            ifUserNameExist (rule, value, callback) {
                if (this.$route.params.id !== 'add') {
                    return
                }

                // 验证
                const regex = /^[a-zA-Z][\w]+$/
                if (!regex.test(value)) {
                    callback(new Error('由至少两位英文字母，数字和下划线组成，以字母开头'))
                }

                this.loading = true
                this.queryUserByName(this.userForm.name, callback)
            },
            /**
             * @description 判断邮箱是否存在
             * @param rule
             * @param value
             * @param callback
             * @returns {*}
             */
            ifEmailExist (rule, value, callback) {
                const regex = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
                if (!regex.test(value)) {
                    callback(new Error('请按照正确邮箱格式输入'))
                }
                UserApi.checkEmailExist(value).then(res => {
                    if (res.user_id) {
                        callback(new Error('邮箱已注册'))
                    } else {
                        callback()
                    }
                })
            },
            reset () {
                this.$router.push('/content/system/user')
            },
            /**
             * 获取用户信息
             * */
            queryUserByName (userName, callback) {
                UserApi.checkUserName(userName).then(res => {
                    if (callback) {
                        this.loading = false
                        if (res.id) {
                            callback(new Error('该登录名已经存在，请重新输入'))
                        } else {
                            callback()
                        }
                    }
                }, err => {
                    console.log(err)
                    if (callback) {
                        this.loading = false
                    }
                })
            },
            queryUserById (userId) {
                UserApi.queryUserById(userId).then(res => {
                    let userInfo = res
                    this.userForm = {...userInfo}

                    this.userForm.organization = {
                        org_id: userInfo.org_id,
                        org_array: userInfo.org_array
                    }
                    if (!this.$route.query.init_user) {
                        this.queryUserOrgById(userInfo.org_id, userInfo.default_project_id)
                    }
                })
            },
            queryUserOrgById (orgId, projectId) {
                OrgApi.queryOrgByNameOrId({
                    org_id: orgId,
                    project_id: projectId
                }).then(res => {
                    this.defaultOrg = res.org_info
                })
            },
            submit () {
                this.isSaving = true
                this.$refs.userForm.validate(valid => {
                    if (valid) {
                        let user = JSON.parse(JSON.stringify(this.userForm))
                        delete user.re_password
                        delete user.organization
                        user.domain_id = localStorage.getItem('domainId')
                        user.org_id = null
                        if (this.userForm.organization) {
                            user.org_array = this.userForm.organization.org_array
                            user.org_id = this.userForm.organization.org_id
                        }
                        this.disableSubmit = true
                        if (this.$route.params.id === 'add') {
                            delete user.id
                            UserApi.createUser(user).then(res => {
                                this.$router.push('/content/system/user')
                                this.$notify({
                                    type: 'success',
                                    message: '创建用户成功'
                                })
                            })
                            return
                        }

                        UserApi.updateUser(user).then(res => {
                            this.isSaving = false
                            this.$router.push('/content/system/user')
                            this.$notify({
                                type: 'success',
                                message: '修改用户成功'
                            })
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else this.isSaving = false
                })
            },

            tenantChange () {
                this.userForm.organization = null
            },
            // 检验是否是强密码
            checkPasswordStronger (rule, value, callback) {
              // UCMP3-6517 密码不得使用登录账号的单词
              if (this.userForm.name && value.indexOf(this.userForm.name) >= 0) {
                callback(new Error(`密码中不能包含登录名`))
                return
              }
              UserApi.registerCheckPasswordStronger(value)
              .then(res => {
                console.log(res)
                if (res.code !== 1) {
                  callback(new Error(`密码验证不符合规则${res.common}`))
                } else {
                  callback()
                }
              })
            }
        },
        created () {
            if (this.$route.params.id !== 'add') {
                let userId = this.$route.params.id
                this.queryUserById(userId)
            }

            if (this.isLocalDomain) {
                UserApi.getCreateUserProject().then(res => {
                    this.tenantList = res
                })
            }
        },
        components: {SearchInputOrganization}
    }
</script>
<style lang="scss" scoped>
    .portal-content {
        overflow: auto;
    }

    .btn-footer {
        margin-left: 120px;
    }
</style>
