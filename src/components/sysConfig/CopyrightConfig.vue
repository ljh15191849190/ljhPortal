<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 版权设置
        el-tabs.portal-content(v-model="tabActive" type="border-card")
            el-tab-pane(:label="item.label" :name="item.prop" v-btn-privilege="item.key" v-for="item in tabItems.privilegefilter('', 'key')" :key="item.prop")
                component(:is="tabActive")
</template>
<script>
    import Normal from './children/NormalConfig'
    import LicenseConf from './children/LicenseConf'

    /**
     * 系统设置 page
     */
    export default {
        data () {
            return {
                tabActive: 'normal',
                tabItems: [
                    {prop: 'normal', label: '常规配置', key: 'copyright'},
                    {prop: 'licenseConf', label: '授权', key: 'copyright_auth'}
                ]
            }
        },
        computed: {
        },
        methods: {},
        created () {
        },
        components: {
            normal: Normal,
            licenseConf: LicenseConf
        }
    }
</script>
<style lang="scss" scoped>
</style>
