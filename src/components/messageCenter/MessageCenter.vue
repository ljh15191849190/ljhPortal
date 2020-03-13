<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 消息中心
        el-tabs.portal-content(v-model="tabActive" type="border-card")
            el-tab-pane(:label="item.label" :name="item.prop" v-btn-privilege="item.key" v-for="item in tabItems.privilegefilter('', 'key')" :key="item.prop")
                component(:is="tabActive")
</template>

<script>
    import MessageStrategy from './children/MessageStrategy' // 消息策略
    import MessageModel from './children/MessageModel'  // 消息模板

    export default {
        data () {
            return {
                tabActive: 'messageStrategy',
                tabItems: [
                    {prop: 'messageStrategy', label: '消息策略', key: 'msg_strategy'},
                    {prop: 'messageModel', label: '消息模板', key: 'msg_template'}
                ]
            }
        },
        components: {
            messageStrategy: MessageStrategy,
            messageModel: MessageModel
        }
    }
</script>

