<template lang="pug">
    div.portal-non-left-nav
        div.title.flex-between
            span 用户信息
        div.content.overflow-y-auto
            el-form.info-color(size="small" label-width="120px" label-position="right")
                el-form-item(label="用户来源") {{findDomainNameById(userInfo.domain_id)}}
                el-form-item(label="用户账号") {{userInfo.name}}
                el-form-item(label="组织机构") {{userInfo.org_name_array.join('/')}}
                el-form-item(label="租户") {{defaultTenantName}}
                el-form-item(label="用户姓名") {{userInfo.realname}}
                el-form-item(label="用户角色")
                    span.mr10(v-for="(role, index) in userInfo.role_info", :key="index") {{role.role_name}} ({{role.role_data}})
                el-form-item(label="电话号码") {{userInfo.tel}}
                el-form-item(label="手机号码") {{userInfo.phone}}
                el-form-item(label="邮箱") {{userInfo.email}}
                el-form-item(label="备注") {{userInfo.comments}}
                el-form-item
                    el-button(@click="back") 返回
</template>

<script>
    /**
     * @description 用户信息
     */
    import api from '@api/axios.users'
    import {mapGetters} from 'vuex'

    export default {
        name: 'UserInfo',
        data () {
            return {
                userInfo: {
                    org_name_array: []
                }
            }
        },
        computed: {
            defaultTenantName () {
                const defaultTenant = this.tenantList.find(item => {
                    return item.id === this.userInfo.default_project_id
                })

                return defaultTenant ? defaultTenant.name : ''
            },
            ...mapGetters([
                'tenantList',
                'domainList' //用户来源列表
            ])
        },
        methods: {
            back () {
                this.$router.go(-1)
            },
            getUserInfo () {
                const userId = localStorage.getItem('userId')
                api.queryUserById(userId).then(res => {
                    this.userInfo = res
                })
            },
            // UCMP3-5537 用户信息展示处的“用户来源”字段要取成name值，现在取的是id，需要改过来。
            findDomainNameById (value) {
              return this.domainList.find(domain => domain.id === value).name
            }
        },
        created () {
            this.getUserInfo()
        }
    }
</script>

<style lang="scss" scoped>
.mr10{
  margin-right: 10px;
}
</style>
