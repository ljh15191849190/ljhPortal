<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 系统设置
        el-tabs.portal-content(v-model="tabActive" type="border-card" v-tab-active="{target: this, valueKey: 'tabActive', activeKey: 'prop', btns: tabItems.privilegefilter('', 'key')}")
            el-tab-pane(:label="item.label" :name="item.prop" v-btn-privilege="item.key" v-for="item in tabItems.privilegefilter('', 'key')" :key="item.prop")
            component(:is="tabActive")
</template>
<script>
    import Identification from './children/Identification'
    import Email from './children/Email' // 邮件配置
    import Note from './children/Note' // 短信配置
    import TechnicalSupport from './children/TechnicalSupport'
    import OrganizationLogo from './children/OrganizationLogo'
    import ManualLibrary from './children/ManualLibrary'

    /**
     * 系统设置 page
     */
    export default {
        data () {
            return {
                tabActive: 'identification',
                tabItems: [
                    {prop: 'identification', label: '认证配置', key: 'sys_auth'},
                    {prop: 'email', label: '邮件配置', key: 'sys_email'},
                    {prop: 'note', label: '短信配置', key: 'sys_msm'},
                    {prop: 'technicalsupport', label: '技术支持', key: 'sys_support'},
                    {prop: 'ManualLibrary', label: '知识库', key: 'sys_manual_library'},
                    {prop: 'organizationlogo', label: '组织机构标识设置', key: 'org_tag'}
                ]
            }
        },
        computed: {
        },
        methods: {

        },
        created () {
        },
        components: {
            email: Email,
            note: Note,
            identification: Identification,
            technicalsupport: TechnicalSupport,
            organizationlogo: OrganizationLogo,
            ManualLibrary: ManualLibrary
        }
    }
</script>
<style lang="scss" scoped>
</style>
