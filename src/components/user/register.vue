<template lang="pug">
    div.register-page
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 注册
            el-breadcrumb-item 创建用户
        div.content
            el-form.form-width(size="small" label-position="right" label-width="120px" :model="userForm" ref="userForm" :rules="rules")
                el-form-item(label="用户来源" prop="domain_id")
                  el-select.normal-form-select-width(v-model="userForm.domain_id"  placeholder="请选择租户", @change="handleDomainChange")
                      el-option(v-for="item in domains"  :key="item.id" :label="item.name" :value="item.id")
                el-form-item(label="登录名" prop="name")
                    el-input(clearable v-model="userForm.name" placeholder="请输入登录名,至少2位" autocomplete="new-password")
                el-form-item(label="密码" prop="password")
                    el-input(clearable v-model="userForm.password" type="password" placeholder="支持英文大小写,数字,特殊符号,不少于12位"  autocomplete="new-password")
                el-form-item(label="确认密码" prop="re_password")
                    el-input(v-model="userForm.re_password" type="password" :maxlength="20" placeholder="请再次输入密码" autocomplete="new-password")   
                el-form-item(label="租户" prop="default_project_id", @change="tenantChange")
                    el-select(v-model="userForm.default_project_id")
                        el-option(v-for="item in tenantList",  :key="item.id" :label="item.name" :value="item.id")
                el-form-item(label="组织结构" prop="organization")
                    SearchInputOrganization.normal-form-select-width(
                        v-model="userForm.organization"
                        :defaultOrg="defaultOrg"
                        :projectId="userForm.default_project_id"
                        :disabled="!userForm.default_project_id")
                    el-tooltip(content="组织机构列表需先选择租户")
                        i.theme-color.el-icon-question.margin-left
                el-form-item(label="姓名" prop="realname")
                    el-input(v-model.trim="userForm.realname" :maxlength="20" placeholder="请输入姓名")
                el-form-item(label="邮箱" prop="email" :maxlength="100")
                    el-input(v-model.trim="userForm.email" placeholder="请输入邮箱")
                el-form-item(label="腾讯通号" prop="rtx")
                    el-input(v-model.trim="userForm.rtx"  placeholder="请输入腾讯通号")
                el-form-item(label="电话号码" prop="tel")
                    el-input(v-model.trim="userForm.tel" :maxlength="20" placeholder="请输入电话号码，可以用-连接，至少7位")
                el-form-item(label="手机号码" prop="phone")
                    el-input(v-model.trim="userForm.phone" :maxlength="20" placeholder="请输入11位手机号码")
                el-form-item(label="备注" prop="comments")
                    el-input(v-model="userForm.comments" type="textarea" :maxlength="250" placeholder="请输入备注，250字符以内")
                el-form-item
                    el-button(type="primary" @click="handleSave" :disabled="disableSubmit" :loading="isSaving") 保存
                    el-button(@click="goLogin") 返回
</template>

<script>
    /**
     * @description 首次修改密码
     */
    import Api from '@api/axios.users'
    import SearchInputOrganization from './components/SearchInputOrganization'
    export default {
        name: 'userForm',
        components: {SearchInputOrganization},
        data () {
            return {
                userForm: {
                    domain_id: '',
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
                    rtx: '' // 腾讯通号
                },
                tenantList: [], //租户列表
                domains: [], // 用户来源列表
                defaultOrg: [],
                loading: false,
                loadingPass: false,
                disableSubmit: false, //不可多次提交
                isSaving: false, //保存时的loading
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
                        {validator: this.isFitPassword, trigger: 'blur'}
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
                }
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
            ifEmailExist (rule, value, callback) {
                const regex = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
                if (!regex.test(value)) {
                    callback(new Error('请按照正确邮箱格式输入'))
                }
                Api.registerCheckEmailExist(value).then(res => {
                    if (res.user_id) {
                        callback(new Error('邮箱已注册'))
                    } else {
                        callback()
                    }
                })
            },
            ifUserNameExist (rule, value, callback) {
                // 验证
                const regex = /^[a-zA-Z][\w]+$/
                if (!regex.test(value)) {
                    callback(new Error('由至少两位英文字母，数字和下划线组成，以字母开头'))
                }

                this.loading = true
                this.queryUserByName(this.userForm.name, callback)
            },
            /**
             * 获取用户信息
             * */
            queryUserByName (userName, callback) {
                Api.registerCheckUserName(userName, this.userForm.domain_id).then(res => {
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
            handleSave () {
                this.isSaving = true
                this.$refs.userForm.validate((valid) => {
                    if (valid) {
                        let user = JSON.parse(JSON.stringify(this.userForm))
                        delete user.re_password
                        delete user.organization
                        user.org_id = null
                        if (this.userForm.organization) {
                            user.org_array = this.userForm.organization.org_array
                            user.org_id = this.userForm.organization.org_id
                        }
                        this.disableSubmit = true
                        Api.registerUser(user).then(res => {
                            this.$router.push('/login')
                            this.isSaving = false
                            this.$notify({
                                type: 'success',
                                message: '注册用户成功'
                            })
                        })
                        .catch((err) => {
                            console.log(err.response)
                            this.isSaving = false
                            this.$notify({
                                type: 'error',
                                message: err.response.data.cn_msg
                            })
                        })
                    } else {
                        this.isSaving = false
                        return false
                    }   
                })
            },

            tenantChange () {
                this.userForm.organization = null
            },
            // 检验是否是强密码
            checkPasswordStronger (rule, value, callback) {
                this.loadingPass = true
                // UCMP3-6281 注册密码不得使用登录账号的单词
                if (this.userForm.name && value.indexOf(this.userForm.name) >= 0) {
                    callback(new Error(`密码中不能包含登录名`))
                    return
                }
                Api.registerCheckPasswordStronger(value)
                .then(res => {
                    this.loadingPass = false
                    if (res.code !== 1) {
                        callback(new Error(`密码验证不符合规则${res.common}`))
                    } else {
                        callback()
                    }
                })
            },
            // 用户来源修改 触发获取租户的接口
            handleDomainChange () {
                this.getTenantList()
            },
            // 获取租户
            getTenantList () {
                Api.getTenantList(this.userForm.domain_id).then(res => {
                    this.tenantList = res
                })
            },
            // 返回
            goLogin () {
                this.$router.push('/login')
            }
        },
        created () {
            Api.getDomainList().then(res => {
                this.domains = res.domains.map(item => {
                    return {
                        id: item.id,
                        name: item.id === 'default' ? '本地' : item.name
                    }
                })
                // 默认选中第一条数据
                this.userForm.domain_id = this.domains.length ? this.domains[0].id : 'default'
                this.getTenantList()
            })
        }
    }
</script>

<style lang="scss" scoped>
    .form-width {
        max-width: 640px;
    }
    .register-page{
        height: 100%;
        padding: 0 10% 20px 10%;
        overflow-y: auto;
        .content {
            background: white;
            padding: 20px 35px;
            box-sizing: content-box;
        }
    }
</style>
