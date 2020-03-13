<template lang="pug">
    div.manual-library
        div.fileListWidth
            el-upload(
            action="gd/v2/sys/file"
            accept=".doc, .docx, .xls, .xlsx, .pdf, .ppt"
            :multiple="false"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadRequest"
            )
                el-button.buttonlocation(size="small" type="default" :loading="isSaving") 上传
        div.pagecontant
            div
                div.lableList(v-for="(item, index) in fileList" :key="item.tel")
                    span {{item.real_name}}
            div
                div.lableList(v-for="(item, index) in fileList" :key="item.tel")
                    span {{item.time}}
            div
                div.lableList(v-for="(item, index) in fileList" :key="item.tel")
                    span.delete(v-if="item.manual_name" @click="clearManual(item)") ×
        div(class="el-upload__tip") 只能上传
            span(style="color:red") doc / docx / xls / xlsx / pdf / ppt
            span 文件，且不超过
            span(style="color:red") 300Mb
        el-button.buttonsave(@click="submitForm" type="primary" size="small") 保存
</template>

<script>
    import ValidationRules from '@mixins/validationRules'
    import HelpCenterApi from '@api/axios.helpcenter'

    /**
     * 知识库
     *
     * @description
     * @author jia.lu
     */

    export default {
        name: 'ManualLibrary',
        mixins: [ValidationRules],
        data () {
            return {
                fileList: [],
                savefileList: [],
                isSaving: false
            }
        },
        created () {
            this.querydownLoadList()
        },
        methods: {
            querydownLoadList () {
                HelpCenterApi.getdownLoadList('docs').then(res => {
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
            /**
             * @description 上传文件之前
             */
            beforeUpload (file) {
                const isLt2M = file.size / (1024 * 1024) <= 300
                if (!isLt2M) {
                    this.$message.error('上传文件大小不能超过 300MB!')
                }
                if (!/\.(docx|doc|xls|xlsx|pdf|ppt)$/.test(file.name)) {
                    this.$message({
                        type: 'warning',
                        message: '仅支持上传docx/doc/xls/xlsx/pdf/ppt文件!'
                    })
                    return false
                }
                return isLt2M
            },
            getBytesLength (Strings) {
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
                if (fileName > 200) {
                    this.$notify({
                        type: 'warning',
                        message: '文件名称过长！'
                    })
                    return false
                }
                this.isSaving = true
                let formData = new FormData()
                formData.append('file', upload.file)

                HelpCenterApi.uploadfile(formData).then(res => {
                    let obj = {}
                    obj.manual_name = res.name
                    obj.manual_file = res.url
                    obj.real_name = res.real_name
                    obj.type = 'docs'
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
    .manual-library {
        position: relative;
        margin: 40px;
    }

    .normal-form-width {
        width: 500px;
    }

    .lableList {
        margin: 8px 40px 8px 0px;
    }

    .manualName {
        position: relative;
    }

    .buttonlocation {
        position: absolute;
        bottom: 0px;
    }

    .buttonsave {
        margin-left: 85px;
    }

    .pagecontant {
        display: flex
    }

    .fileListWidth {
        height: 0px;
    }

    .delete {
        cursor: pointer;
        font-weight: 700;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: .5;
    }
</style>
