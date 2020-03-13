<template lang="pug">
    div#portal
        router-view(v-if="isRouterAlive")
</template>

<script>
    import Utils from '@server/utils'

    export default {
        name: 'app',
        data () {
            return {
                timeInterval: null,
                lastTime: null,
                currentTime: null,
                timeOut: 30 * 60 * 1000,
                isRouterAlive: true
            }
        },
        provide () {
            return {
                reload: this.reload
            }
        },
        computed: {},
        methods: {
            reload () {
                this.isRouterAlive = false
                this.$nextTick(() => {
                    this.isRouterAlive = true
                })
            },
            /**
             * @description 检测session时间过期
             */
            testTime () {
                let sessionTime = sessionStorage.getItem('session_time')
                if (sessionTime) {
                    this.timeOut = Number(sessionTime) * 60 * 1000
                }
                //更新当前时间
                this.currentTime = new Date().getTime()
                //判断是否超时
                if (this.currentTime - this.lastTime > this.timeOut) {
                    window.postMessage({status: 601}, '*')
                    clearInterval(this.timeInterval)
                }
            }
        },
        components: {},
        created () {
            // session失效刷新处理
            if (sessionStorage.getItem('session_invalid')) {
                Utils.tokenExpired()
                return
            }
            // 在页面加载时读取sessionStorage里的状态信息
            sessionStorage.getItem('portal_store_data') && this.$store.replaceState(JSON.parse(sessionStorage.getItem('portal_store_data')))

            // 在页面刷新时将vuex里的信息保存到sessionStorage里
            window.addEventListener('beforeunload', () => {
                sessionStorage.setItem('portal_store_data', JSON.stringify(this.$store.state))
            })
        },
        mounted () {
            this.lastTime = new Date().getTime()
            document.addEventListener('mouseover', () => {
                this.lastTime = new Date().getTime()
            })
            this.timeInterval = setInterval(this.testTime, 5000)
        }
    }
</script>

<style lang="scss" scoped>
    #portal {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background: #eef1f5;
        min-width: 1200px;
    }
</style>
<style lang="scss">
    html, body {
        height: 100%;
    }
</style>

