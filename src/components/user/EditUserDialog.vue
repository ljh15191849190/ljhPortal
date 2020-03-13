<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal" width="600px")
        el-form.normal-form-width(ref="userForm" :model="userForm" :rules="rules" label-width="80px" size="small")
            el-form-item.is-required(label="登录名")
                el-input(v-model="userForm.name" :maxlength="20" :disabled="true" placeholder="请输入登录名，至少2位")
            el-form-item.is-required(v-if="isLocalDomain" label="租户" prop="default_project_id")
                el-select.normal-form-select-width(v-model="userForm.default_project_id" :disabled="true" placeholder="请选择租户")
                    el-option(v-for="item in tenantList" v-if="item.enabled" :key="item.id" :label="item.name" :value="item.id")
            el-form-item(label="组织机构" prop="organization")
                SearchInputOrganization.normal-form-select-width(
                v-model="userForm.organization"
                :defaultOrg="defaultOrg"
                :projectId="userForm.default_project_id")
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
            <!-- admin不可禁用 -->
            el-form-item(v-if="!isAdminUser && isLocalDomain" label="是否启用" prop="enabled")
                el-radio-group(v-model="userForm.enabled")
                    el-radio(:label="item.value" v-for="item in enables" :key="item.id" ) {{item.name}}
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="closeModal") 取消
            el-button(type="primary" size="small" @click="submitForm" :loading="isSaving") 保存
</template>
<script>
    /**
     * @description 编辑用户组件
     * @author david
     */
    import UserApi from '@api/axios.users'
    import OrgApi from '@api/axios.organization'
    import SearchInputOrganization from '@lib/SearchInputOrganization'
    import {mapGetters} from 'vuex'

    export default {
        props: ['visible', 'userId'],
        components: {SearchInputOrganization},
        data () {
            return {
                userForm: {
                    id: '',
                    name: '',
                    default_project_id: '',
                    realname: '',
                    tel: '',
                    phone: '',
                    email: '',
                    organization: null,
                    enabled: 'true',
                    comments: '',
                    rtx: '' //腾讯通号
                },
                enables: [
                    {id: 'enable', name: '启用', value: 1},
                    {id: 'disable', name: '禁用', value: 0}
                ],
                org_id: '',
                organizations: [],
                rules: {
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
                isSaving: false,
                originEmail: '',
                defaultOrg: []
            }
        },
        computed: {
            title () {
                return `编辑用户【${this.userForm.name}】`
            },
            isAdminUser () {
                // TODO
                return this.userForm.name === 'admin'
            },
            isLocalDomain () {
                return localStorage.getItem('domainId') === 'default'
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
            /**
             * 获取用户信息
             * */
            queryUserById (userId) {
                UserApi.queryUserById(userId).then(res => {
                    if (res) {
                        let userInfo = res
                        this.userForm = {...userInfo}
                        if (userInfo.org_id) {
                            this.org_id = userInfo.org_id
                            this.userForm.organization = Array.isArray(userInfo.org_array) ? userInfo.org_array : JSON.parse(userInfo.org_array)
                        }

                        // 当前注册邮箱
                        this.originEmail = userInfo.email
                        this.userForm.organization = {
                            org_id: userInfo.org_id,
                            org_array: userInfo.org_array
                        }
                        this.queryUserOrgById(userInfo.org_id, userInfo.default_project_id)
                    }
                }, err => {
                    console.log(err)
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
            submitForm () {
                this.isSaving = true
                this.$refs.userForm.validate(valid => {
                        if (valid) {
                            let user = JSON.parse(JSON.stringify(this.userForm))
                            delete user.organization
                            user.domain_id = localStorage.getItem('domainId')
                            user.org_id = null
                            if (this.userForm.organization) {
                                user.org_array = this.userForm.organization.org_array
                                user.org_id = this.userForm.organization.org_id
                            }
                            UserApi.updateUser(user).then(res => {
                                this.isSaving = false
                                this.$emit('updateUser')
                                this.$router.push('/content/system/user')
                                this.$notify({
                                    type: 'success',
                                    message: '修改用户成功'
                                })
                            }).catch(e => {
                                this.isSaving = false
                            })
                        } else this.isSaving = false
                    }
                )
            },
            /**
             * @description 判断邮箱是否存在
             * @param rule
             * @param value
             * @param callback
             * @returns {*}
             */
            ifEmailExist (rule, value, callback) {
                if (value === this.originEmail) {
                    return callback()
                }
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
            }
        },
        created () {
            this.queryUserById(this.userId)
        }
    }
</script>
<style lang="scss" scoped>
    .end-time {
        padding-left: 8px;
    }
</style>
