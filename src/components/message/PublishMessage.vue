<template lang="pug">
    div.portal-non-left-nav.msg
        div.title
            span 站内消息
            i.portal-icon-circle
            span 发布消息
        div.content
            el-form.form(size="small" label-position="right" label-width="80px" :model="msg" ref="msg" :rules="rules")
                el-form-item.title-item(label="标题" prop="title")
                    el-input.title-input(v-model="msg.title" maxlength="50" placeholder="请输入消息标题")
                    span.title-info.info-color 50字以内
                el-form-item(label="内容" prop="content")
                    el-input(v-model="msg.content" type="textarea" maxlength="200" :autosize="{minRows:8}" placeholder="请输入消息内容")
                el-form-item
                    el-button(@click="back") 返回
                    el-button(type="primary" @click="pulish") 发布
</template>

<script>
    /**
     * @description 发布消息
     */
    import api from '@api/axios.notice'
    import noticeType from '@mock/notice/notice_type'

    export default {
        name: 'PublishMessage',
        data () {
            return {
                msg: {
                    title: '',
                    content: '',
                    notice_type: '2',
                    notice_type_name: '通知'
                },
                noticeType: noticeType,
                rules: {
                    title: [
                        {required: true, message: '请输入消息标题', trigger: 'blur'}
                    ],
                    content: [
                        {required: true, message: '请输入消息内容', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            pulish: function () {
                this.$refs.msg.validate(valid => {
                    if (valid) {
                        api.publishNotice(this.msg).then(res => {
                            this.$notify({
                                type: 'success',
                                message: '消息通知发布成功'
                            })
                        })

                        this.back()
                    }
                })
            },
            back () {
                this.$router.push('/content/message')
            }

        }
    }
</script>

<style lang="scss" scoped>
    .form {
        max-width: 1000px;

        .title-item {
            position: relative;
            .title-input {
                padding-right: 80px;
            }

            .title-info {
                position: absolute;
                right: 0;
                top: 0;
            }
        }
    }

    .portal-icon-circle {
        display: inline-block;
        margin: 0 12px;
        color: #ccc;
    }
</style>
