<template lang="pug">
    iframe#portal-content-frame(allowFullScreen)
</template>
<script>
    /* eslint-disable */
    import {mapGetters, mapActions} from 'vuex'

    export default {
        data () {
            return {}
        },
        watch: {
            productId () {
                if (this.productId) {
                    this.$nextTick(
                        () => {
                            // 如果是站内消息跳转过来的, 只跳转一次
                            if (this.jumpDetailHref) {
                                let jumpHref = this.jumpDetailHref
                                // 跳转之后需要清空站内消息链接 避免多次跳转
                                this.setJumpDetailHref('')
                                document.getElementById('portal-content-frame').src = jumpHref
                            } else
                                this.loadProductPage()
                        }
                    )
                }
            }
        },
        computed: {
            productId () {
                return this.$route.params.id
            },
            ...mapGetters([
                'apps',
                'jumpDetailHref'
            ])
        },
        methods: {
            /**
             * @description 动态加载不同产品的页面
             * @author xinghua.wen
             */
            loadProductPage () {
                if (process.env.NODE_ENV !== 'development') {
                    // UCMP3-2264 支持其他平台的服务嵌套显示
                    let app = this.apps.find(app => {
                        return app.prop === this.productId && app.remote_url
                    })
                    if (app) {
                        document.getElementById('portal-content-frame').src = app.remote_url
                        return
                    }
                    document.getElementById('portal-content-frame').src = '/static/' + this.productId + '-ui' + '/index.html'
                    return
                }
                // 开发环境跳转
                if (this.productId === 'ucmp')
                    document.getElementById('portal-content-frame').src = 'http://localhost:8100/#/'
                else if (this.productId === 'atomflow')
                    document.getElementById('portal-content-frame').src = 'http://localhost:8080/#/'
                else if (this.productId === 'cmdb')
                    document.getElementById('portal-content-frame').src = 'http://localhost:8090/#/'
                else if (this.productId === 'appcenter')
                    document.getElementById('portal-content-frame').src = 'https://www.21vbluecloud.com/cloud-solutions/solutions-overview/'
            },
            ...mapActions([
                'setJumpDetailHref'
            ])
        },
        mounted () {
            // 如果是站内消息跳转过来的 只跳转一次
            if (this.jumpDetailHref) {
                // 跳转之后需要清空站内消息链接 避免多次跳转
                let jumpHref = this.jumpDetailHref
                this.setJumpDetailHref('')
                document.getElementById('portal-content-frame').src = jumpHref
            } else
                this.loadProductPage()
        }
    }
</script>
<style lang="scss" scoped>

</style>
