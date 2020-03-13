<template lang="pug">
    div
        el-form.normal-form-width(size="small" label-width="150px")
            el-form-item.narmal(label="应用系统")
                el-select(v-model="app" @change="queryLicense")
                    el-option(v-for="item in appList" :key="item.id" :value="item.id" :label="item.label")

            template(v-if="confForm")
                el-form-item(v-if="confForm.version" label="授权版本") {{confForm.version}}
                el-form-item(v-if="confForm.authObject" label="客户公司名称") {{confForm.authObject}}
                el-form-item(label="状态") {{status}}
                template(v-for="item in confForm.authItem")
                    el-form-item(:label="item.type") {{item.total}}{{item.unit === '核' ? item.unit : ''}} | {{getStatus(item.status)}} | 剩余可用{{item.left || 0}}{{item.unit}}
        el-upload.upload-btn(
        accept=".lic, .LIC"
        :disabled="isSaving"
        slot="trigger"
        size="small"
        action="guardian/setting/upload/license"
        type="primary"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :http-request="httpRequest")
            el-button(v-btn-privilege="'copyright_auth_upload'" slot="trigger" size="small" type="primary" :loading="isSaving") {{uploadBtn}}
</template>

<script>
    /**
     * @description 授权
     *  页面模型
     const tempObj = {
                'version': '2.3.8',
                'authObject': 'leaptocloud',
                'status': 'active',
                'authItems': [{
                    'type': '有效期',
                    'status': 'active',
                    'total': '2018-09-26',
                    'left': '130',
                    'unit': '天',
                    'message': null
                }]
             }
     */
    import api from '@api/axios.configuration'
    import {mapGetters} from 'vuex'
    export default {
        name: 'licenseConf',
        data () {
            return {
                app: '',
                confForm: null,
                fileList: [],
                isSaving: false,
                needLicense: ['ucmp', 'cmdb', 'atomflow']
            }
        },
        computed: {
            appList () {
                return this.apps.filter(item => this.needLicense.indexOf(item.prop) > -1)
            },
            status () {
                return this.confForm.status === 'active' ? '有效' : '无效'
            },
            uploadBtn () {
                return JSON.stringify(this.confForm) === 'null' ? '上传授权码' : '更新授权码'
            },
            ...mapGetters([
                'apps'
            ])
        },
        methods: {
            /**
             * @description 获取当前应用系统license
             */
            queryLicense (appId) {
                api.getLicense(appId).then(res => {
                    this.confForm = res
                })
            },
            httpRequest (upload) {
                this.isSaving = true

                let formData = new FormData()
                formData.append('file', upload.file)
                formData.append('module_id', this.app)
                api.updateLicense(formData).then(res => {
                    this.isSaving = false
                    this.$notify({
                        type: 'success',
                        message: '授权码上传成功'
                    })
                    this.queryLicense(this.app)
                }).catch(e => {
                    this.isSaving = false
                })
            },
            /**
             * @description 上传文件之前的钩子函数
             */
            beforeUpload (file) {
                const isLt2M = file.size / (1024 * 1024) <= 1

                if (!isLt2M) {
                    this.$message.error('上传文件大小不能超过 1MB!')
                }

                return isLt2M
            },
            getStatus (status) {
                return status === 'active' ? '有效' : '无效'
            }
        },
        created () {
            // UCMP3-2929【系统管理】版权设置，授权码已经上传，但是默认跳转不显示已经上传的版权信息。
            // 默认UCMP模块，如果ucmp模块不在，就不显示
            let ucmpModule = this.appList.find(item => item.prop === 'ucmp')
            if (ucmpModule) {
                this.app = ucmpModule.id
                this.queryLicense(ucmpModule.id)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .upload-btn {
        margin-left: 150px;
    }
</style>