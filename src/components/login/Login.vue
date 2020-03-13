<template lang="pug">
    div.position-relative.app-login-container
        el-carousel.full-content(v-if="system.login_background.length" :interval="5000" arrow="never" height="100%" indicator-position="none")
            el-carousel-item(v-for="item in system.login_background" :key="item")
                img.full-content(:src="item")
        ParticlesBackground(v-else :title="title" :animation="animation.switch")
        div.full-content.login-content
            div.c-background__content
                div.c-background__title
                    img(:src="system.sys_logo")
                    span {{ title }}
            div.app-description
                div.first-row {{system.login_title}}
                div.secondary-row(v-html="formatStr(system.login_description)")
            div.portal-container.login-container
                LoginForm
            div.animation-switch(v-if="!system.login_background.length")
                div.animation-panel.d-flex
                    span.panel-title 动画
                    el-tooltip(effect='light' :content="animation.tip" placement="top-start")
                        el-switch(v-model="animation.switch" :active-color="animation.activeColor")
            div.portal-container.login-footer {{ copyright }}
</template>
<script>
    import ParticlesBackground from './ParticlesBackground'
    import AnimatedNodes from '@lib/AnimatedNodes'
    import LoginForm from './LoginForm'
    import ConfApi from '@api/axios.configuration'
    import {mapGetters, mapActions} from 'vuex'

    /**
     * @description 登陆
     */
    export default {
        data () {
            return {
                title: '',
                copyright: '',
                animation: {
                    activeColor: '#13ce66',
                    switch: true,
                    tip: '动画背景可能引起客户端CPU飙升，为了得到更好的体验，建议配置较低的客户端关闭动画效果'
                }
            }
        },
        methods: {
            getLicence () {
                ConfApi.getSystemConfig().then(res => {
                    this.copyright = res.copyright
                    this.title = res.sys_name

                    this.setSystemInfo(res)

                    //初始化保存时存下超时时间
                    sessionStorage.setItem('session_time', this.system.session_expire)
                })
            },

            formatStr (str) {
                if (!str) return ''
                return str.replace(/\n/g, '<br/>')
            },

            ...mapActions([
                'setSystemInfo'
            ])
        },
        computed: {
            ...mapGetters([
                'system'
            ])
        },
        watch: {
            'animation.switch' () {
                window.localStorage.setItem('login-animation', this.animation.switch ? 'on' : 'off')
            }
        },
        created () {
            this.getLicence()

            // UCMP3-4540 初始化动画开关值
            let animation = window.localStorage.getItem('login-animation')
            if (animation !== undefined && animation === 'off') this.animation.switch = false
            else window.localStorage.setItem('login-animation', this.animation.switch ? 'on' : 'off')
        },
        components: {
            AnimatedNodes,
            ParticlesBackground,
            LoginForm
        }
    }
</script>
<style lang="scss" scoped>
    .app-description {
        position: absolute;
        left: calc(37.5% - 100px);
        top: 50%;
        color: #fff;
        margin-top: -83px;
        margin-left: -260px;
        .first-row {
            font-size: 55px;
            margin-bottom: 12px;
        }
        .secondary-row {
            font-size: 24px;
        }
    }
    .animation-switch {
        position: absolute;
        right: 16px;
        top: 100px;
    }
    .panel-title {
        color: #fff;
        font-size: 14px;
        margin-right: 5px;
        line-height: 20px;
    }

    .el-carousel {
        z-index: 0;
    }

    .login-content {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }
</style>
