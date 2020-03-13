<template lang="pug">
    el-form.normal-form-width.normal-config.w650(ref="normalForm" :model="system" :rules="rules" label-width="160px" size="small")
        el-form-item(label="系统LOGO" prop="sys_logo")
            el-upload(drag
            class="uploader"
            action="gd/v2/sys/file"
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="httpRequest")
                img.logo(v-if="system.sys_logo" :src="logoUrl")
                i.el-icon-plus.uploader-icon(v-else)
                div.close(v-if="system.sys_logo" @click="clearLogo") ×
            el-input.hidden(v-model="system.sys_logo")
        el-form-item(label="系统名称" prop="sys_name")
            el-input(v-model="system.sys_name" placeholder="请输入系统名称（最多8个字符）" :maxlength="8")

        el-form-item(label="登录界面标题" prop="login_title")
            el-input(v-model="system.login_title" placeholder="请输入登录界面标题（最多9个字符）" :maxlength="9")
        el-form-item(label="登录界面描述" prop="login_description")
            section.w450-inline
                el-input(v-model="system.login_description" type="textarea" :rows="5" placeholder="请输入登录界面描述（最多75个字符，建议每行不超过25个字符）" :maxlength="75")
            el-tooltip(effect="light" content="最多75个字符，建议每行不超过25个字符")
                i.theme-color.el-icon-question.margin-left(@click="pwd_rule_tooltip = !pwd_rule_tooltip")
        el-form-item(label="上传背景图片" prop="login_background")
            el-upload(
            ref="loginBg"
            :http-request="httpBgRequest"
            :on-remove="handleBgRemove"
            :file-list="loginBgListOrigin"
            :before-upload="beforeBgUpload"
            :on-exceed="handleBgExceed"
            :limit="4"
            list-type="picture-card"
            class="uploader"
            action="gd/v2/sys/file"
            accept=".gif,.png,.jpg,.bmp,.jpeg")
                i.el-icon-plus
                div.el-upload__tip(slot="tip") 只能上传gif, png, jpg, bmp, jpeg文件，图片尺寸建议1920 * 1248
        el-form-item(label="版本")
            span {{system.version}}
        el-form-item(label="版权信息" prop="copyright")
            el-input(v-model="system.copyright" placeholder="请输入版权信息" :maxlength="100")
        el-form-item(label="技术支持邮箱" prop="surport_mail")
            el-input(v-model="system.surport_mail" placeholder="请输入邮箱地址" :maxlength="100")
        el-form-item(label="技术服务热线" prop="surport_tel")
            el-input(v-model="system.surport_tel" placeholder="请输入电话号码" :maxlength="50")
        el-form-item(label="超时时间" prop="session_expire")
            el-input-number(v-model="system.session_expire" placeholder="15~720" :max="720" :min="15" :precision="0" :step="15")
            span.margin-left 分钟
        el-form-item(label="license到期设置" prop="license_expire")
            el-input-number(v-model="system.license_expire" placeholder="1~30" :max="30" :min="1" :precision="0")
            span.margin-left 天前
        el-form-item(label="登录名区分大小写" prop="case_sensitive")
            el-switch(v-model="system.case_sensitive" :active-value="1" active-text="区分" :inactive-value="0" inactive-text="不区分")
        el-form-item(label="登录密码规则"  prop="pwd_rules")
            section.w450-inline
              el-input(v-model="system.pwd_rules" placeholder="请输入登录密码规则")
            el-tooltip(:manual="true", v-model="pwd_rule_tooltip", effect="light")
                i.theme-color.el-icon-question.margin-left(@click="pwd_rule_tooltip = !pwd_rule_tooltip")
                template(slot="content")
                    p.center   常见登录密码规则
                    p
                        code /^(?!_)(?!.*?_$)[a-zA-Z0-9_\-\u4e00-\u9fa5]{8,}$/
                    p
                        code /^\w+{8,}$/
                    p
                        code /^[a-zA-Z][a-zA-Z0-9_]{8,}$/
        el-form-item(label="密码规则说明" prop="rule_description")
            section.w450-inline
                el-input(v-model="system.rule_description" placeholder="请输入登录密码规则说明")
        el-form-item
            el-button(v-btn-privilege="'copyright_save'" @click="submitForm" type="primary" :loading="isSaving") 保存
</template>
<script>
    import OprApi from '@api/axios.configuration'
    import Utils from '@server/utils'
    import {mapActions} from 'vuex'

    export default {
        data () {
            return {
                pwd_rule_tooltip: false, // 是否展示密码规则
                loginBgList: [],
                loginBgListOrigin: [],
                system: {
                    id: '',
                    sys_name: 'IT运营管理中枢',
                    sys_logo: '',
                    copyright: '',
                    log_delete_time: '',
                    surport_mail: '',
                    surport_tel: '',
                    version: '',
                    case_sensitive: 0, //0 不区分， 1 区分
                    session_expire: 30,
                    license_expire: 7,
                    pwd_rules: '',
                    rule_description: '',
                    login_title: '企业云化原动力',
                    login_description: '任何IT及服务\n计算、存储、分析、查询 一站式云端大数据服务',
                    login_background: []
                },
                rules: {
                    sys_logo: [
                        {required: true, message: '请上传Logo图片', trigger: 'blur'}
                    ],
                    sys_name: [
                        {
                            required: true,
                            message: '请输入系统名称（最多8个字符）',
                            trigger: 'blur'
                        },
                        {
                            pattern: /^[\u4e00-\u9fa5\w\-]+$/,
                            message: '由汉字，英文字母，数字，下划线和连词符组成',
                            trigger: 'blur'
                        }
                    ],
                    copyright: [
                        {required: true, message: '请输入版权信息', trigger: 'blur'}
                    ],
                    surport_mail: [
                        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
                        {
                            type: 'email',
                            message: '请输入正确的邮箱地址',
                            trigger: 'blur,change'
                        }
                    ],
                    surport_tel: [
                        {required: true, message: '请输入电话号码', trigger: 'blur'},
                        {validator: this.checkPhone, trigger: 'blur'}
                    ],
                    session_expire: [
                        {required: true, message: '请输入超时时间', trigger: 'blur'}
                    ],
                    license_expire: [
                        {
                            required: true,
                            message: '请输入license到期设置',
                            trigger: 'blur'
                        }
                    ],
                    case_sensitive: [
                        {
                            required: true,
                            message: '请选择登录名是否区分大小写',
                            trigger: 'blur'
                        }
                    ],
                    pwd_rules: [{required: true, message: '请填写登录密码规则', trigger: 'blur'}],
                    rule_description: [
                        {required: true, message: '请填写登录密码说明', trigger: 'blur'},
                        {max: 100, message: '登录密码说明小于等于100个字符', trigger: 'blur'}
                    ],
                    login_title: [
                        {
                            required: true,
                            message: '请输入登录界面标题',
                            trigger: 'blur'
                        },
                        {min: 3, message: '请输入至少3位字符', trigger: 'blur'},
                        {max: 9, message: '输入至多9位字符', trigger: 'blur'}
                    ],
                    login_description: [
                        {max: 75, message: '输入至多75位字符', trigger: 'blur'},
                        {validator: this.validationDesc, trigger: 'blur'}
                    ]
                },
                isSaving: false
            }
        },
        methods: {
            /**
             * @description 校验电话号码
             */
            checkPhone (rule, value, callback) {
                if (!/^[\d|\-]{7,14}$/.test(value)) {
                    return callback(new Error('请输入正确的电话号码'))
                }

                callback()
            },
            submitForm () {
                this.isSaving = true
                this.$refs.normalForm.validate((valid) => {
                    if (valid) {
                        this.system.login_background = this.loginBgList.map(item => item.id)
                        OprApi.updateSystemConfig(this.system).then(res => {
                            //保存时存下超时时间
                            sessionStorage.setItem('session_time', this.system.session_expire)
                            this.setSystemInfo(this.system)
                            //创建成功
                            this.$notify({
                                type: 'success',
                                message: '保存配置成功'
                            })

                            this.isSaving = false
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else this.isSaving = false
                })
            },
            httpRequest (upload) {
                let formData = new FormData()
                formData.append('file', upload.file)
                OprApi.uploadLogo(formData).then(res => {
                    this.system.sys_logo = res.url
                })
            },
            beforeUpload (file) {
                const isLt2M = file.size / 1024 / 1024 <= 1

                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 1MB!')
                }

                return isLt2M
            },
            clearLogo () {
                this.system.sys_logo = ''
            },
            httpBgRequest (upload) {
                let formData = new FormData()
                formData.append('file', upload.file)
                OprApi.uploadLogo(formData).then(res => {
                    this.loginBgList.push({id: res.url, url: Utils.logoUrl(res.url)})
                })
            },
            handleBgRemove (file, fileList) {
                this.loginBgList = this.loginBgList.filter(item => item.id !== file.id)
            },
            beforeBgUpload (file) {
                if (!/\.(gif|png|jpg|bmp|jpeg)$/.test(file.name)) {
                    this.$message({
                        type: 'warning',
                        message: '仅支持上传gif, png, jpg, bmp, jpeg文件!'
                    })
                    return false
                }

                return true
            },
            handleBgExceed (files, fileList) {
                this.$message.warning('当前限制上传4个文件')
            },

            validationDesc (rule, value, callback) {
                let lines = value.split(/\n/)
                if (lines.length > 3) {
                    callback(new Error('登录界面描述不能超过3行'))
                }
                if (lines.find(item => item.length > 25)) {
                    callback(new Error('登录界面描述每行字符不能超过25'))
                }
                callback()
            },

            ...mapActions([
                'setSystemInfo'
            ])
        },
        computed: {
            logoUrl () {
                return this.system.sys_logo ? Utils.logoUrl(this.system.sys_logo) : ''
            }
        },
        created () {
            OprApi.getSystemConfig().then(res => {
                this.system = res
                this.loginBgList = this.system.login_background.map((item, index) => {
                    return {
                        id: item,
                        url: Utils.logoUrl(item)
                    }
                })
                this.loginBgListOrigin = this.loginBgList.concat()
            })
        }
    }
</script>
<style lang="scss" scoped>
    .uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: visible;
    }

    .uploader .el-upload:hover {
        border-color: #409EFF;
    }

    .uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 35px;
        position: relative;
        top: 3px;
        line-height: 1;
        text-align: center;
        vertical-align: middle;
    }

    .logo {
        max-width: 180px;
        display: block;
        background-color: $logoBgColor;
    }

    .hidden {
        display: none;
    }

    .close {
        position: absolute;
        top: -5px;
        right: -20px;
    }
    .w450-inline {
      display: inline-block;
      width: 450px;
    }
    .w650 {
      width: 650px;
    }
    .center {
      text-align: center;
    }
</style>
<style lang="scss">
    .normal-config {
        .el-upload-dragger {
            height: auto;
            width: auto;
            min-height: 35px;
            max-width: 180px;
            overflow: visible;
        }
    }

</style>
