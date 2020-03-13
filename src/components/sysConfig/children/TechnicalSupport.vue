<template lang="pug">
    el-tabs(v-model="activeName" v-tab-active="{target: this, valueKey: 'activeName', activeKey: 'name', btns: tabs.privilegefilter('', 'prop')}")
        el-tab-pane.margin(v-btn-privilege="tab.prop" v-for="tab in tabs.privilegefilter('', 'prop')" :key="tab.prop" :label="tab.label" :name="tab.name")
            // el-button(type="default" size="small" round @click="addNewParam()") 新增
            el-form.normal-form-width(ref="technicalForm" v-if="tab.prop == 'sys_support_tel'" :model="technicalForm" class="demo-form-inline")
                el-row(v-if="technicalForm.extra_params.length" v-for="(param ,index) in technicalForm.extra_params" :key="param.id")
                    el-col(:span="8")
                        el-form-item(:prop="'extra_params.'+index+'.contact_name'" :rules="[{ required: true, message: '名称不能为空'}]") 
                            el-input(v-model="param.contact_name" size="small" placeholder="名称" :maxlength="20")
                    el-col(:span="1")
                        div.symboltype ：
                    el-col(:span="9")
                        el-form-item(:prop="'extra_params.'+index+'.tel'" :rules="[{ required: true, message: '请输入电话号码', trigger: 'blur' }]")
                            el-input(v-model="param.tel" size="small" placeholder="电话" :maxlength="12")
                    el-col.phonemarginLeft(:span="3")
                        el-tooltip(content="新增" effect="dark" placement="right" )
                            el-button(size="small" icon="el-icon-plus" type="primary" circle @click="addNewParam()")
                    el-col(:span="2")
                        el-tooltip(content="删除" effect="dark" placement="right" )
                            el-button(size="small" icon="el-icon-minus" type="info" plain circle @click="deleteCustomParam(param)")
                el-button(v-if="technicalForm.extra_params.length===0" icon="el-icon-circle-plus-outline" size="small" type="primary" @click="addNewParam") 添加技术支持电话
            el-button(v-if="tab.prop == 'sys_support_tel'" v-btn-privilege="'sys_support_tel_save'" @click="telsubmitForm" type="primary" :loading="isSaveTelLoading" size="small") 保存
            div.fileListWidth(v-if="tab.prop == 'sys_support_manual'")
                el-upload(
                        action="gd/v2/sys/file"
                        accept=".doc, .docx"
                        :multiple="false"
                        :show-file-list="false"
                        :before-upload="beforeUpload"
                        :http-request="uploadRequest"
                    )
                    el-button.buttonlocation(size="small" type="default" :loading="isSaving") 上传
            div.pagecontant(v-if="tab.prop == 'sys_support_manual'")
                div
                    div.lableList(v-for="(item, index) in fileList" :key="item.tel") 
                        span {{item.real_name}}
                div       
                    div.lableList(v-for="(item, index) in fileList" :key="item.tel")        
                        span {{item.time}}
                div       
                    div.lableList(v-for="(item, index) in fileList" :key="item.tel")    
                        span.delete(v-if="item.manual_name" @click="clearManual(item)") ×
            div(v-if="tab.prop == 'sys_support_manual'" class="el-upload__tip") 只能上传
                span(style="color:red") doc/docx
                span 文件，且不超过
                span(style="color:red") 300Mb
            el-button.buttonsave(v-if="tab.prop == 'sys_support_manual'" v-btn-privilege="'sys_support_manual_save'" @click="submitForm" type="primary" size="small") 保存
</template>
<script>
/**
 * @description 
 */

import ValidationRules from '@mixins/validationRules'
import HelpCenterApi from '@api/axios.helpcenter'

export default {
    mixins: [ValidationRules],
    data () {
        return {
            tabs: [
                { prop: 'sys_support_tel', label: '技术支持电话', name: 'first' },
                { prop: 'sys_support_manual', label: '使用手册', name: 'second' }
            ],
            fileList: [],
            savefileList: [],
            uploadItems: [],
            activeName: 'first',
            technicalForm: {
                extra_params: [] // 自定义参数
            },
            isSaving: false,
            isSaveTelLoading: false,
            project_id: localStorage.getItem('tenant')
        }
    },
    created () {
        this.queryPhoneList()
        this.querydownLoadList()
    },
    methods: {
        queryPhoneList () {
            HelpCenterApi.getHelpPhoneList(this.projectId).then(res => {
                if (res) {
                    this.technicalForm.extra_params = res
                }
            })
        },
        querydownLoadList () {
            HelpCenterApi.getdownLoadList().then(res => {
                if (res) {
                    this.fileList = res
                }
            })
        },
        // 删除手册
        clearManual (data) {
            let val = data.manual_name
            let deleteid = data.id
            if (deleteid) {
                HelpCenterApi.deleteDownLoadList(val).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '删除成功'
                    })
                    this.fileList = this.fileList.filter(item => item !== data)
                })
            } else {
                // 点击上传 但是没有保存 此处不走接口直接删掉就好
                this.$notify({
                        type: 'success',
                        message: '删除成功'
                })
                this.fileList = this.fileList.filter(item => item !== data)
            }
        },
        // 保存电话
        telsubmitForm () {
            this.isSaveTelLoading = true
            this.$refs.technicalForm[0].validate().then(res => {
                if (res) {
                    // 需求变化 原来的新增的保存 改为全部保存
                    let data = this.technicalForm.extra_params
                    if (data && data.length > 0) {
                        HelpCenterApi.addHelpPhoneList(data).then(res => {
                            this.$notify.success('保存成功')
                            this.queryPhoneList()
                            this.isSaveTelLoading = false
                            // this.technicalForm.extra_params.forEach(item => delete item.saveflag)
                        }, () => {
                            this.$notify.error('保存失败')
                            this.isSaveTelLoading = false
                        })
                    }
                }
            })
        },
        //保存文件
        submitForm () {
            let data = this.savefileList.filter(item => !item.id)
            // 没有上传文件（或者直接删除文件）然后点击保存，不走保存接口（没有新的上传文件）。
            if (data && data.length > 0) {
                HelpCenterApi.savefile(data).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '保存成功'
                    })
                    this.savefileList = []
                    this.querydownLoadList()
                })
            }
        },
        // 添加电话
        addNewParam () {
            if (this.technicalForm.extra_params) {
                this.technicalForm.extra_params.push({
                    contact_name: '',
                    tel: ''
                })
            }
        },

        // 删除电话
        deleteCustomParam (val) {
            let data = val.id
            if (data) {
                HelpCenterApi.deleteHelpPhoneList(data).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '删除成功'
                    })
                    this.queryPhoneList()
                })
            } else {
                this.technicalForm.extra_params = this.technicalForm.extra_params.filter(item => item !== val)
            }
        },
        /**
             * @description 上传文件之前
        */
        beforeUpload (file) {
            const isLt2M = file.size / (1024 * 1024) <= 300
            if (!isLt2M) {
                this.$message.error('上传文件大小不能超过 300MB!')
            }
            if (!/\.(docx|doc)$/.test(file.name)) {
                this.$message({
                    type: 'warning',
                    message: '仅支持上传docx/doc文件!'
                })
                return false
            }
            // this.uploadfile = file
            // return true
            return isLt2M
        },
        getBytesLength  (Strings) {   
            let totalLength = 0     
            let charCode  
            for (var i = 0; i < Strings.length; i++) {  
                charCode = Strings.charCodeAt(i)  
                 if (charCode < 0x007f) {     
                     totalLength++     
                 } else if ((charCode >= 0x0080) && (charCode <= 0x07ff)) {     
                     totalLength += 2     
                 } else if ((charCode >= 0x0800) && (charCode <= 0xffff)) {     
                     totalLength += 3   
                 } else {  
                     totalLength += 4   
                 }          
             }  
            return totalLength   
        },
        uploadRequest (upload) {
            let fileName = this.getBytesLength(upload.file.name)
            let repeatName = this.fileList.filter(item => item.real_name === upload.file.name)
            if (repeatName && repeatName.length > 0) {
                this.$notify({
                    type: 'warning',
                    message: '上传失败，文件重名！'
                })
                return false
            }
            if (fileName > 50) {
                this.$notify({
                    type: 'warning',
                    message: '文件名称过长！'
                })
                return false
            }
            this.isSaving = true
            let formData = new FormData()
            formData.append('file', upload.file)
            // HelpCenterApi.uploadfile(formData).then(res => {
            //         this.fileList = res.url
            //     })
            HelpCenterApi.uploadfile(formData).then(res => {
                let obj = {}
                obj.manual_name = res.name
                obj.manual_file = res.url
                obj.real_name = res.real_name
                obj.type = 'manual'
                this.fileList.push(obj)
                this.savefileList.push(obj)
                this.isSaving = false
                this.$notify({
                    type: 'success',
                    message: '上传成功'
                })
            }).catch(e => {
                this.isSaving = false
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.normal-form-width {
  width: 500px;
}
.margin {
  margin-left: 40px;
}
.fileListWidth {
  width: 40%;
}
.lableList {
  margin: 8px 40px 8px 0px;
}
.manualName {
  position: relative;
}
.buttonlocation{
    position: absolute;
    bottom: 0px;
}
.buttonsave{
    margin-left: 85px;
}
.phonemarginLeft{
    margin-left:8px
}
.symboltype{
    line-height:40px
}
.pagecontant{
    display:flex
}
.fileListWidth {
    height: 0px;
}
.delete{
    cursor: pointer;
    font-weight: 700;
    color: #000;
    text-shadow: 0 1px 0 #fff;
    opacity: .5;
}
</style>
