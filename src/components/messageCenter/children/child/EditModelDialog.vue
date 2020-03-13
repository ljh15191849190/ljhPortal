<template lang="pug">
    el-dialog(
    :title="'编辑模板--' + editTemplateObj.strategy_app_name"
    :visible.sync="dialogStatus"
    :close-on-click-modal="clickModelClose"
    width="800px"
    )
        div
            el-row
                el-col.p-2(:span="3")
                    strong 模板类型
                el-col.p-2(:span="5")
                    strong 变量参数
                    el-tooltip(placement="top")
                        div(slot="content")
                            | 变量参数在内容中以
                            span.theme-color {%变量关键字%}
                            | 格式插入
                            p
                                | 如：您申请的云主机
                                span.theme-color {%ecs_name%}
                                | 即将到期，请前往续期...
                        i.el-icon-warning.warning-color.tip-icon
                el-col.p-2(:span="16")
                    strong 消息内容
            el-row.border-top(v-for="template in editTemplateObj.template_list" :key="template.id")
                el-col.p-2(:span="3") {{template.type_name}}
                el-col.p-2(:span="5")
                    div(v-if="getVariable(template.variable).length")
                        p(v-for="(item, index) in getVariable(template.variable)" :key="index")
                            span.theme-color.margin-right {{item.key}}
                            | ({{item.value}})
                    div(v-else) --
                el-col.p-2(:span="16")
                    el-form(size="small" ref="template" :model="template" :rules="rules" label-position="left" label-width="50px")
                        // type_id: 0 邮件, 1 短信, 2 站内消息
                        el-form-item(label="标题" prop="title" v-if="template.type_id !== 1")
                            el-input(v-model.trim="template.title")
                        el-form-item(label="内容" prop="content")
                            el-input(type="textarea" :autosize="{ minRows: 4}" placeholder="请输入内容" v-model.trim="template.content")
        span(slot="footer")
            el-button(size="small" @click="closeDialog") 取消
            el-button(size="small" type="primary" @click="saveTemplate") 保存
</template>
<script>
    /**
     * 编辑消息模板dialog弹窗组件
     */
    import ValidationRules from '@mixins/validationRules'

    export default {
        mixins: [ValidationRules],
        props: {
            dialogVisible: {
                type: Boolean,
                default: false
            },
            editTemplateObj: {
                type: Object,
                default: () => {
                }
            }
        },
        data () {
            return {
                clickModelClose: false,
                rules: {
                    title: [
                        {
                            required: true,
                            message: '请输入消息标题',
                            trigger: ['blur', 'change']
                        },
                        {
                            validator: this.validationName,
                            trigger: ['blur', 'change']
                        },
                        {
                            max: 64,
                            message: '长度不能超过64位',
                            trigger: ['blur', 'change']
                        }
                    ],
                    content: [
                        {
                            required: true,
                            message: '请输入文本内容',
                            trigger: ['blur', 'change']
                        }
                    ]
                }
            }
        },
        methods: {
            saveTemplate () {
                /**
                 * @augments flagCount 统计校验成功的表单数量
                 *  当所有的template表单都校验成功时关闭弹窗
                 */
                let flagCount = 0

                this.$refs.template.forEach(el => {
                    el.validate().then(res => {
                        if (res) {
                            flagCount++
                            if (flagCount === this.$refs.template.length) {
                                this.$emit('saveTemplate')
                            }
                        }
                    }).catch((res) => {
                    })
                })
            },

            closeDialog () {
                this.dialogStatus = false
            },

            // 获取模板中的变量参数
            getVariable (variable) {
                if (Array.isArray(JSON.parse(variable))) {
                    return JSON.parse(variable)
                } else {
                    return []
                }
            }
        },
        computed: {
            dialogStatus: {
                get () {
                    return this.dialogVisible
                },
                set (val) {
                    this.$emit('update:dialogVisible', val)
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .tip-icon {
        margin-left: 5px;
        cursor: pointer;
    }

    .margin-right {
        margin-right: 6px;
    }
</style>
