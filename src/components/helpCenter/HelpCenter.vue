<template lang="pug">
    div.portal-non-left-nav.message-center
        div.title.flex-between
            span
                span 帮助中心
                el-button.back(type="info" plain size="mini" icon="portal-icon-back" @click="back") 返回
        div
            el-tabs.portal-content(v-model="tabActive" type="border-card")
                el-tab-pane(:label="item.label" :name="item.prop" v-for="item in tabItems" :key="item.prop")
                component(:is="tabActive")
</template>
<script>
    /**
     * @description 帮助中心
     */
    import TechTelephone from './TechTelephone' 
    import Instruction from './Instruction'  

    export default {
        name: 'Message',
        data () {
            return {
                tabActive: 'techTelephone',
                tabItems: [
                    {prop: 'techTelephone', label: '技术支持电话'},
                    {prop: 'instruction', label: '使用手册'}
                ]
            }
        },
        components: {
            techTelephone: TechTelephone,
            instruction: Instruction
        },
        methods: {
            back () {
                let product = sessionStorage.getItem('portal-route-navbar')
                let beforeMessageCenter = sessionStorage.getItem('before-message-center')
                // 其他产品 创建的时候会回到上一次访问的路由
                if (product !== 'system') this.$router.push('/content/product/' + product)
                // 系统管理下的需要记忆的路由跳转
                else this.$router.push(beforeMessageCenter ? beforeMessageCenter : '/content/system/user')
            }
        }
    }
</script>
<style lang="scss">
    .floatright {
        float: right;
    }
    .back{
        margin-left: 10px
    }
</style>
