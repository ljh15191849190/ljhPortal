<template lang="pug">
    el-form.normal-form-width(ref="normalForm" :model="normalForm" :rules="rules" label-width="160px")
        el-form-item(label="用户来源")
            span AD/LDAP
        el-form-item(label="服务器" prop="server_addr")
            el-input(v-model="normalForm.server_addr" size="small" placeholder="例如：192.168.16.31" :maxlength="50")
        el-form-item(label="是否启用SSL" prop="is_ssl")
            el-radio-group(v-model="normalForm.is_ssl")
                el-radio(:label="1") 是
                el-radio(:label="0") 否
        el-form-item(label="端口" prop="server_port")
            el-input(v-model="normalForm.server_port" size="small" :maxlength="10" :placeholder="portPlaceholder")
        el-form-item(label="用户名" prop="user_name")
            el-input(v-model="normalForm.user_name" size="small" placeholder="请输入用户名：如administrator@example.com" :maxlength="100" autocomplete="new-password")
        el-form-item(label="密码" prop="user_pass")
            el-input(v-model="normalForm.user_pass" type="password" size="small" :placeholder="passplaceholder" :maxlength="200" autocomplete="new-password")
        el-form-item(label="BaseDN" prop="base_dn")
            el-row
                el-col(:span="17")
                    el-input(v-model="normalForm.base_dn" size="small" placeholder="OU=研发中心,DC=example,DC=com" :maxlength="200")
                el-col.mar-email-right(:span="5")
                    el-button(@click="testLdap" size="small" :disabled="disabled") 测试验证
        el-form-item(label="是否更新服务器域配置")
            <!--el-checkbox(v-model="normalForm.is_update") 是否更新服务器域配置-->
            el-switch(v-model="normalForm.is_update" :active-value="1" active-text="更新" :inactive-value="0" inactive-text="不更新" )
        el-form-item(label="自动同步")
            el-switch(v-model="normalForm.timing_enadle" :active-value="1" active-text="是" :inactive-value="0" inactive-text="否" )
            section.flex_inline(v-if="normalForm.timing_enadle === 1")
                section.form_item.w300.mr10
                    label 同步BaseDN
                    el-input(v-model="normalForm.timing_base_dn", size="small")
            section.flex_inline(v-if="normalForm.timing_enadle === 1")
                section.form_item.w100.mr10
                    label 开始时间
                    el-time-select(v-model="normalForm.sync_startTime", :picker-options="{start: '00:00',step: '01:00',end: '23:00'}", size="small", :clearable="false")
                section.form_item.w100
                    label 同步周期
                    el-select.w100(v-model="normalForm.sync_cycle", size="small")
                        el-option(v-for="(cycle, index) in cycles", :value="cycle.value", :label="cycle.label", :key="index")
        el-form-item
            el-button(v-btn-privilege="'sys_auth_save'" @click="submitForm" type="primary" size="small" :loading="saveDisabled") 保存
</template>
<script>
    /**
     * @description 认证配置
     */
    import OprApi from '@api/axios.configuration'

    export default {
        data () {
            return {
                passplaceholder: '******',
                source: '',
                disabled: false,
                saveDisabled: false,
                cycles: [
                  {value: '0-6', label: '每天'},
                  {value: '1', label: '每周一'},
                  {value: '2', label: '每周二'},
                  {value: '3', label: '每周三'},
                  {value: '4', label: '每周四'},
                  {value: '5', label: '每周五'},
                  {value: '6', label: '每周六'},
                  {value: '0', label: '每周日'}
                ],
                normalForm: {
                    id: '',
                    porject_id: localStorage.getItem('tenant'),
                    server_addr: '',
                    server_port: '',
                    is_ssl: 0,
                    user_name: '',
                    user_pass: '',
                    base_dn: '',
                    timing_base_dn: '',
                    is_update: 0,
                    timing_enadle: 0, //是否同步
                    sync_cycle: '0-6', //同步周期
                    sync_startTime: '00:00' //同步开始时间
                },
                rules: {
                    server_addr: [
                        {required: true, message: '请输入服务器地址', trigger: 'blur'}
                    ],
                    is_ssl: [
                        {required: true, message: '请选择是否启用SSL', trigger: 'blur'}
                    ],
                    server_port: [
                        {required: true, message: '请输入端口号', trigger: 'blur'},
                        {validator: this.portCheck, trigger: 'blur'}
                    ],
                    user_name: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    user_pass: [
                        {required: false, message: '请输入密码', trigger: 'blur'}
                    ],
                    base_dn: [
                        {required: true, message: '请输入BaseDN', trigger: 'blur'},
                        {validator: this.isMatchBaseDn, trigger: 'blur'}
                    ]
                },
                portPlaceholder: '默认端口为：389'
            }
        },
        computed: {
        },
        methods: {
            submitForm () {
                this.saveDisabled = true
                // 没有自动同步规则的话 删除字段
                if (this.normalForm.timing_enadle === 0) {
                    delete this.normalForm.timing_base_dn
                    delete this.normalForm.sync_startTime
                    delete this.normalForm.sync_cycle
                } else {
                    if (!this.normalForm.sync_startTime) {
                        this.$message.error('请填写开始时间')
                        this.saveDisabled = false
                        return false
                    }
                    // 自动同步 组装参数
                    let hourString = parseInt(this.normalForm.sync_startTime.split(':')[0]) // 去除‘01’前面的0
                    let timingObj = {
                        hour: `${hourString}`,
                        week: this.normalForm.sync_cycle
                    }
                    this.normalForm.timing = JSON.stringify(timingObj)
                }
                this.$refs.normalForm.validate((valid) => {
                    if (valid) {
                        if (this.normalForm.is_update) {
                            this.$confirm('更换认证方式，服务会重启，可能会造成用户无法登录，是否确认修改认证方式？', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                this.createLdap()
                            }).catch(() => {
                                this.saveDisabled = false
                            })
                        } else {
                            this.createLdap()
                        }
                    } else this.saveDisabled = false
                })
            },
            isMatchBaseDn (rule, value, callback) {
                /*
                * 原子作业平台ATOMFLOWAT-147
                * 问题原因：baseDN未加校验
                * 解决方法：baseDN加校验
                * 回归版本：v0.1
                * */
                // 根据服务接口更新验证方式只验证'='和',', 且','在'='后边
                let equal = value.indexOf('=')
                let spIndex = value.indexOf(',')

                let isMatch = equal > -1 && spIndex > -1 && spIndex > equal

                if (!isMatch) {
                    callback(new Error('格式不正确!'))
                } else {
                    callback()
                }
            },
            portCheck (rule, value, callback) {
                const regex = /^\d+$/
                if (!regex.test(value)) {
                    callback(new Error('请输入数字!'))
                } else {
                    const tempNum = parseInt(value)
                    if (tempNum < 1 || tempNum > 65535) {
                        callback(new Error('请输入正确的端口号1-65535!'))
                    } else {
                        callback()
                    }
                }
            },
            createLdap () {
                let resData = this.normalForm
                resData.server_port = parseInt(resData.server_port)
                OprApi.createLdap(resData).then(res => {
                    this.saveDisabled = false
                    if (res.id) {
                        this.$notify({
                            type: 'success',
                            message: this.normalForm.is_update ? '更新配置成功!' : '保存配置成功!'
                        })
                    }
                }).catch(() => {
                    this.saveDisabled = false
                })
            },
            testLdap () {
                this.disabled = true
                let resData = this.normalForm
                OprApi.testLdap(resData).then(res => {
                    //测试验证(1:成功， 0：失败)
                    this.disabled = false
                    if (res.code === 1) {
                        this.$notify({
                            type: 'success',
                            message: '连接成功'
                        })
                    } else {
                        this.$notify({
                            type: 'error',
                            message: '连接失败'
                        })
                    }
                }).catch(() => {
                    this.disabled = false
                })
            }
        },
        created () {
            this.source = 'directory'
            OprApi.getLdap().then(res => {
                if (!res.id) {
                    this.rules.user_pass[0].required = true
                    this.passplaceholder = '请输入密码'
                }
                this.normalForm = Object.assign(this.normalForm, res)
                // 处理自动同步的参数赋值
                if (res.crontab) {
                    let {hour, week} = JSON.parse(res.crontab)
                    this.normalForm.sync_startTime = hour.length === 1 ? `0${hour}:00` : `${hour}:00`
                    this.normalForm.sync_cycle = week
                }
            })
        }
    }
</script>
<style lang="scss" scoped>
    .mar-email-right {
        margin-left: 26px;
    }
    .flex_inline{
        display: flex;
        align-items: center;
        .form_item{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            label {
                margin-bottom: 0;
            }
        }
    }
    .w100 {
        width: 100px;
        .el-input{
            width: 100px;
        }
    }

    .w300 {
        width: 300px;
        .el-input {
            width: 300px;
        }
    }

    .mr10 {
        margin-right: 10px;
    }
</style>
