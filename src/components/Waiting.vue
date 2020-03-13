<template lang="pug">
    div.full-content(v-loading="loading")
</template>

<script>
    // import LoginApi from '@api/axios.login'
    import {mapActions} from 'vuex'

    export default {
        data () {
            return {
                loading: true
            }
        },
        created () {
            // mock
            // let domain_id = 'default'
            // let username = this.$route.query.name
            // 使用path中的username参数进行登录动作
            this.$nextTick(() => {
                this.setIsDefaultPassword(this.$route.query.first_login)
                localStorage.setItem('authenticationToken', this.$route.query.token)
                // 登陆信息
                localStorage.setItem('domainId', this.$route.query.domain_id)
                localStorage.setItem('systemUserName', this.$route.query.username)

                // 新增返回参数，当前登陆租户id
                localStorage.setItem('tenant', this.$route.query.login_project_id)
                this.$router.push('/content')
            })
        },
        methods: {
            ...mapActions([
                'setIsDefaultPassword'
            ])
        }
    }
</script>

