<template lang="pug">
    el-form.login-form(ref="loginForm" :model="loginForm" :rules="rules" label-position="top" label-width="100px")
        //div.svg-container
            div
                svg.mySVG(xmlns='http://www.w3.org/2000/svg', xmlns:xlink='http://www.w3.org/1999/xlink', viewBox='0 0 200 200')
                    defs
                        circle#armMaskPath(cx='100', cy='100', r='100')
                    clippath#armMask
                        use(xlink:href='#armMaskPath', overflow='visible')
                    circle(cx='100', cy='100', r='100', fill='#a9ddf3')
                    g.body
                        path.bodyBGchanged(style='display: none;', fill='#FFFFFF', d='M200,122h-35h-14.9V72c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0l0,91h200L200,122z')
                        path.bodyBGnormal(stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoinn='round', fill='#FFFFFF', d='M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z')
                        path(fill='#DDF1FA', d='M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z')
                    g.earL
                        g.outerEar(fill='#ddf1fa', stroke='#3a5e77', stroke-width='2.5')
                        circle(cx='47', cy='83', r='11.5')
                        path(d='M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1', stroke-linecap='round', stroke-linejoin='round')
                        g.earHair
                        rect(x='51', y='64', fill='#FFFFFF', width='15', height='35')
                        path(d='M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9', fill='#fff', stroke='#3a5e77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round')
                    g.earR
                        g.outerEar
                        circle(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', cx='153', cy='83', r='11.5')
                        path(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1')
                        g.earHair
                        rect(x='134', y='64', fill='#FFFFFF', width='15', height='35')
                        path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M146.6,62.8 c4.9,4.6,8.4,9.4,10.6,14.2c-3.4-0.1-6.8-0.1-10.1,0.1c4,3.7,6.8,7.6,8.2,11.6c-2.1,0-4.2,0-6.3,0.2c2.6,4.1,3.8,8.3,3.7,12.5 c-1.2-0.7-3.4-1.4-5.2-1.9')
                    path.chin(d='M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1', fill='none', stroke='#3a5e77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round')
                    path.face(fill='#DDF1FA', d='M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46')
                    path.hair(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474')
                    g.eyebrow
                        path(fill='#FFFFFF', d='M138.142,55.064c-4.93,1.259-9.874,2.118-14.787,2.599c-0.336,3.341-0.776,6.689-1.322,10.037 c-4.569-1.465-8.909-3.222-12.996-5.226c-0.98,3.075-2.07,6.137-3.267,9.179c-5.514-3.067-10.559-6.545-15.097-10.329 c-1.806,2.889-3.745,5.73-5.816,8.515c-7.916-4.124-15.053-9.114-21.296-14.738l1.107-11.768h73.475V55.064z')
                        path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599')
                    g.eyeL
                        circle(cx='85.5', cy='78.5', r='3.5', fill='#3a5e77')
                        circle(cx='84', cy='76', r='1', fill='#fff')
                    g.eyeR
                        circle(cx='114.5', cy='78.5', r='3.5', fill='#3a5e77')
                        circle(cx='113', cy='76', r='1', fill='#fff')
                    g.mouth
                        path.mouthBG(fill='#617E92', d='M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z')
                        path.mouthSmallBG(style='display: none;', fill='#617E92', d='M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z')
                        path.mouthMediumBG(style='display: none;', d='M95,104.2c-4.5,0-8.2-3.7-8.2-8.2v-2c0-1.2,1-2.2,2.2-2.2h22c1.2,0,2.2,1,2.2,2.2v2 c0,4.5-3.7,8.2-8.2,8.2H95z')
                        path.mouthLargeBG(style='display: none;', d='M100 110.2c-9 0-16.2-7.3-16.2-16.2 0-2.3 1.9-4.2 4.2-4.2h24c2.3 0 4.2 1.9 4.2 4.2 0 9-7.2 16.2-16.2 16.2z', fill='#617e92', stroke='#3a5e77', stroke-linejoin='round', stroke-width='2.5')
                        defs
                        path#mouthMaskPath(d='M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z')
                        clippath#mouthMask
                        use(xlink:href='#mouthMaskPath', overflow='visible')
                        g(clip-path='url(#mouthMask)')
                        g.tongue
                            circle(cx='100', cy='107', r='8', fill='#cc4a6c')
                            ellipse.tongueHighlight(cx='100', cy='100.5', rx='3', ry='1.5', opacity='.1', fill='#fff')
                        path.tooth(clip-path='url(#mouthMask)', style='fill:#FFFFFF;', d='M106,97h-4c-1.1,0-2-0.9-2-2v-2h8v2C108,96.1,107.1,97,106,97z')
                        path.mouthOutline(fill='none', stroke='#3A5E77', stroke-width='2.5', stroke-linejoin='round', d='M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z')
                    path.nose(d='M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z', fill='#3a5e77')
                    g.arms(clip-path='url(#armMask)')
                        g.armL(style='visibility: hidden;')
                            polygon(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', points='121.3,98.4 111,59.7 149.8,49.3 169.8,85.4')
                            path(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', d='M134.4,53.5l19.3-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-10.3,2.8')
                            path(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', d='M150.9,59.4l26-7c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-21.3,5.7')
                            g.twoFingers
                                path(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', d='M158.3,67.8l23.1-6.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-23.1,6.2')
                                path(fill='#A9DDF3', d='M180.1,65l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L180.1,65z')
                                path(fill='#DDF1FA', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', d='M160.8,77.5l19.4-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-18.3,4.9')
                                path(fill='#A9DDF3', d='M178.8,75.7l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L178.8,75.7z')
                            path(fill='#A9DDF3', d='M175.5,55.9l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L175.5,55.9z')
                            path(fill='#A9DDF3', d='M152.1,50.4l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L152.1,50.4z')
                            path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M123.5,97.8 c-41.4,14.9-84.1,30.7-108.2,35.5L1.2,81c33.5-9.9,71.9-16.5,111.9-21.8')
                            path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M108.5,60.4 c7.7-5.3,14.3-8.4,22.8-13.2c-2.4,5.3-4.7,10.3-6.7,15.1c4.3,0.3,8.4,0.7,12.3,1.3c-4.2,5-8.1,9.6-11.5,13.9 c3.1,1.1,6,2.4,8.7,3.8c-1.4,2.9-2.7,5.8-3.9,8.5c2.5,3.5,4.6,7.2,6.3,11c-4.9-0.8-9-0.7-16.2-2.7')
                            path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M94.5,103.8 c-0.6,4-3.8,8.9-9.4,14.7c-2.6-1.8-5-3.7-7.2-5.7c-2.5,4.1-6.6,8.8-12.2,14c-1.9-2.2-3.4-4.5-4.5-6.9c-4.4,3.3-9.5,6.9-15.4,10.8 c-0.2-3.4,0.1-7.1,1.1-10.9')
                            path(fill='#FFFFFF', stroke='#3A5E77', stroke-width='2.5', stroke-linecap='round', stroke-linejoin='round', d='M97.5,63.9 c-1.7-2.4-5.9-4.1-12.4-5.2c-0.9,2.2-1.8,4.3-2.5,6.5c-3.8-1.8-9.4-3.1-17-3.8c0.5,2.3,1.2,4.5,1.9,6.8c-5-0.6-11.2-0.9-18.4-1 c2,2.9,0.9,3.5,3.9,6.2')
                        g.armR(style='visibility: hidden;')
                            path(fill='#ddf1fa', stroke='#3a5e77', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', stroke-width='2.5', d='M265.4 97.3l10.4-38.6-38.9-10.5-20 36.1z')
                            path(fill='#ddf1fa', stroke='#3a5e77', stroke-linecap='round', stroke-linejoin='round', stroke-miterlimit='10', stroke-width='2.5', d='M252.4 52.4L233 47.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l10.3 2.8M226 76.4l-19.4-5.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l18.3 4.9M228.4 66.7l-23.1-6.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l23.1 6.2M235.8 58.3l-26-7c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l21.3 5.7')
                            path(fill='#a9ddf3', d='M207.9 74.7l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM206.7 64l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM211.2 54.8l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM234.6 49.4l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8z')
                            path(fill='#fff', stroke='#3a5e77', stroke-linecap='round', stroke-linejoin='round', stroke-width='2.5', d='M263.3 96.7c41.4 14.9 84.1 30.7 108.2 35.5l14-52.3C352 70 313.6 63.5 273.6 58.1')
                            path(fill='#fff', stroke='#3a5e77', stroke-linecap='round', stroke-linejoin='round', stroke-width='2.5', d='M278.2 59.3l-18.6-10 2.5 11.9-10.7 6.5 9.9 8.7-13.9 6.4 9.1 5.9-13.2 9.2 23.1-.9M284.5 100.1c-.4 4 1.8 8.9 6.7 14.8 3.5-1.8 6.7-3.6 9.7-5.5 1.8 4.2 5.1 8.9 10.1 14.1 2.7-2.1 5.1-4.4 7.1-6.8 4.1 3.4 9 7 14.7 11 1.2-3.4 1.8-7 1.7-10.9M314 66.7s5.4-5.7 12.6-7.4c1.7 2.9 3.3 5.7 4.9 8.6 3.8-2.5 9.8-4.4 18.2-5.7.1 3.1.1 6.1 0 9.2 5.5-1 12.5-1.6 20.8-1.9-1.4 3.9-2.5 8.4-2.5 8.4')
        el-form-item.login-title
            span 用户登录
        el-form-item(prop='username' label='您的账号')
            el-input.input(id='loginUser' v-model='loginForm.username' autofocus
            prefix-icon='portal-icon-user' sise='mini'
            @keyup.enter.native='submitForm')
        el-form-item(prop='password' label='您的密码')
            el-input.input(id='loginPassword' v-model='loginForm.password' :type='!plainText ? "password" : "text"'
            auto-complete='new-password'
            prefix-icon='portal-icon-password' sise='mini' @keyup.enter.native='submitForm')
            label.input-icon(:class="[plainText ? 'portal-icon-see': 'portal-icon-not-see']" for="togglepasswd")
                input.toggle-passwd-checkbox(:checked="plainText" type="checkbox" id="togglepasswd" @change="changePlainpasswd($event)")
                div.indicator
        el-form-item(prop='domain_id' label='用户来源' v-if="domains.length > 1")
            el-select.user-type(sise='mini' v-model='loginForm.domain_id' )
                el-option(v-for='item in domains' :key='item.id' :value='item.id' :label='item.name')
        el-form-item
            el-button.user-type-half(
            round
            type='primary'
            @click='submitForm'
            :disabled='isLogining'
            v-loading='isLogining'
            element-loading-background='rgba(255, 255, 255, 0.1)') 登录
            el-button.user-type-half(
            round
            type='primary'
            @click="jumpRegister"
            element-loading-background='rgba(255, 255, 255, 0.1)'
              ) 注册
</template>
<script>
    import LoginApi from '@api/axios.login'
    import {mapActions} from 'vuex'
    import {TweenMax, Expo} from 'gsap'
    import Utils from '@server/utils'

    export default {
        data () {
            return {
                loginForm: {
                    username: null,
                    password: '',
                    domain_id: ''
                },
                domains: [],
                disabled: false,
                rules: {
                    username: [
                        {required: true, message: '请输入您的账号', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入您的密码', trigger: 'blur'}
                    ],
                    domain_id: [
                        {required: true, message: '请选择用户来源', trigger: 'change'}
                    ]
                },
                copyright: '',
                isLogining: false,
                userName: null,
                userNameCoords: null,
                armL: null,
                armR: null,
                eyeL: null,
                screenCenter: null,
                eyeLCoords: null,
                eyeRCoords: null,
                noseCoords: null,
                mouthCoords: null,
                userNameScrollMax: null,
                eyesCovered: false,
                chin: null,
                face: null,
                eyebrow: null,
                outerEarL: null,
                outerEarR: null,
                plainText: false,
                activeElement: null
            }
        },
        methods: {
            /**
             * @description 清除缓存
             */
            clearStorage () {
                Utils.tokenExpired()
            },

            jumpRegister () {
                this.$router.push('/register')
            },

            submitForm () {
                if (this.isLogining) {
                    return
                }
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        this.isLogining = true
                        LoginApi.login(this.loginForm).then(res => {
                            /*
                             * 原子作业平台ATOMFLOWAT-142
                             * 问题原因：功能不完善
                             * 解决办法：根据服务接口返回不同的code码给出相应的提示
                             * 回归版本：v0.1
                             */
                            this.isLogining = false
                            if (res) {
                                if (res.code === 0) {
                                    this.$notify({
                                        type: 'error',
                                        message: '用户登录信息错误或者没有租户权限!'
                                    })
                                } else if (res.code === 3) {
                                    this.$notify({
                                        type: 'error',
                                        message: '认证失败!'
                                    })
                                } else if (res.code === 1) {
                                    this.$notify({
                                        type: 'warning',
                                        message: '该账户被禁用,请联系管理员!'
                                    })
                                } else if (res.code === -1) {
                                    this.$notify({
                                        type: 'warning',
                                        message: '请填写账户名以及密码、域!'
                                    })
                                } else if (res.code === 2) {
                                    this.$notify({
                                        type: 'success',
                                        message: '登录成功,欢迎进入!'
                                    })

                                    // UCMP3-1744 token超时实例存在时，销毁该实例，不影响登陆后token失效机制的单例实现
                                    if (window._expiredAction) {
                                        window._expiredAction.delete()
                                    }
                                    this.setIsDefaultPassword(res.first_login)
                                    this.setCheckoutProject(res.checkout_project)

                                    // 登陆信息
                                    localStorage.setItem('domainId', this.loginForm.domain_id)
                                    localStorage.setItem('systemUserName', this.loginForm.username)

                                    // UCMP-791 【AD同步】AD域用户同步至系统之后，角色分配无法选择租户。
                                    // 新增返回参数，当前登陆租户id
                                    localStorage.setItem('tenant', res.login_project_id)
                                    localStorage.setItem('userId', res.user_id)
                                    this.$router.push('/content')
                                } else {
                                    this.$notify({
                                        type: 'error',
                                        message: '登录未知错误，错误码:' + res.code
                                    })
                                }
                            }
                        }, () => {
                            this.isLogining = false
                        })
                    }
                })
            },
            onNameFocus (e) {
                // e.target.parentElement.classList.add('focusWithText')
                this.onNameInput(e)
            },
            onNameInput (e) {
                let mouthStatus = 'small'
                let mouthBG = document.querySelector('.mouthBG')
                let mouthMediumBG = document.querySelector('.mouthMediumBG')
                let mouthMaskPath = document.querySelector('#mouthMaskPath')
                let mouthOutline = document.querySelector('.mouthOutline')
                let tooth = document.querySelector('.tooth')
                let tongue = document.querySelector('.tongue')
                this.calculateFaceMove(e)
                var value = this.userName.value
                let curuserNameIndex = value.length

                // very crude userName validation to trigger effects
                if (curuserNameIndex > 0) {
                    if (mouthStatus === 'small') {
                        mouthStatus = 'medium'
                        TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {
                            morphSVG: mouthMediumBG,
                            shapeIndex: 8,
                            ease: Expo.easeOut
                        })
                        TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut})
                        TweenMax.to(tongue, 1, {x: 0, y: 1, ease: Expo.easeOut})
                        TweenMax.to([this.eyeL, this.eyeR], 1, {
                            scaleX: 0.85,
                            scaleY: 0.85,
                            ease: Expo.easeOut
                        })
                    } else {
                        mouthStatus = 'medium'
                        TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {
                            morphSVG: mouthMediumBG,
                            ease: Expo.easeOut
                        })
                        TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut})
                        TweenMax.to(tongue, 1, {x: 0, y: 1, ease: Expo.easeOut})
                        TweenMax.to([this.eyeL, this.eyeR], 1, {
                            scaleX: 0.85,
                            scaleY: 0.85,
                            ease: Expo.easeOut
                        })
                    }
                } else {
                    let mouthSmallBG = document.querySelector('.mouthSmallBG')
                    mouthStatus = 'small'
                    TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {
                        morphSVG: mouthSmallBG,
                        shapeIndex: 9,
                        ease: Expo.easeOut
                    })
                    TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut})
                    TweenMax.to(tongue, 1, {y: 0, ease: Expo.easeOut})
                    TweenMax.to([this.eyeL, this.eyeR], 1, {
                        scaleX: 1,
                        scaleY: 1,
                        ease: Expo.easeOut
                    })
                }
            },
            onNameBlur () {
                this.resetFace()
            },
            onPasswdFocus () {
                this.activeElement = 'password'
                if (!this.eyesCovered) {
                    this.coverEyes()
                }
            },
            onPasswdBlur (ev) {
                this.activeElement = null
                setTimeout(
                    () => {
                        if (this.activeElement === 'toggle' || this.activeElement === 'password') {
                            return
                        }
                        this.uncoverEyes()
                    }, 100
                )
            },
            /**
             * @description 遮眼睛
             */
            coverEyes () {
                let bodyBGchanged = document.querySelector('.bodyBGchanged')
                TweenMax.killTweensOf([this.armL, this.armR])
                TweenMax.set([this.armL, this.armR], {visibility: 'visible'})
                TweenMax.to(this.armL, 0.45, {
                    x: -93,
                    y: 10,
                    rotation: 0,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.armR, 0.45, {
                    x: -93,
                    y: 10,
                    rotation: 0,
                    ease: Expo.easeOut,
                    delay: 0.1
                })
                TweenMax.to(this.bodyBG, 0.45, {
                    morphSVG: bodyBGchanged,
                    ease: Expo.easeOut
                })
                this.eyesCovered = true
            },
            /**
             * @description 睁开眼睛
             */
            uncoverEyes () {
                TweenMax.killTweensOf([this.armL, this.armR])
                TweenMax.to(this.armL, 1.35, {y: 220, ease: Expo.easeOut})
                TweenMax.to(this.armL, 1.35, {
                    rotation: 105,
                    ease: Expo.easeOut,
                    delay: 0.1
                })
                TweenMax.to(this.armR, 1.35, {y: 220, ease: Expo.easeOut})
                TweenMax.to(this.armR, 1.35,
                    {
                        rotation: -105,
                        ease: Expo.easeOut,
                        delay: 0.1,
                        onComplete: function () {
                            TweenMax.set([this.armL, this.armR], {visibility: 'hidden'})
                        }
                    }
                )
                TweenMax.to(this.bodyBG, 0.45, {
                    morphSVG: this.bodyBG,
                    ease: Expo.easeOut
                })
                this.eyesCovered = false
            },
            /**
             * @description 眼睛睁开个缝隙
             */
            spreadFingers () {
                let twoFingers = document.querySelector('.twoFingers')
                TweenMax.to(twoFingers, 0.35, {
                    transformOrigin: 'bottom left',
                    rotation: 30,
                    x: -9,
                    y: -2,
                    ease: Expo.easeInOut
                })
            },
            closeFingers () {
                let twoFingers = document.querySelector('.twoFingers')
                TweenMax.to(twoFingers, 0.35, {
                    transformOrigin: 'bottom left',
                    rotation: 0,
                    x: 0,
                    y: 0,
                    ease: Expo.easeInOut
                })
            },
            /**
             * @description 重置猴脸
             */
            resetFace () {
                TweenMax.to([this.eyeL, this.eyeR], 1, {
                    x: 0,
                    y: 0,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.nose, 1, {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.mouth, 1, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.chin, 1, {
                    x: 0,
                    y: 0,
                    scaleY: 1,
                    ease: Expo.easeOut
                })
                TweenMax.to([this.face, this.eyebrow], 1, {
                    x: 0,
                    y: 0,
                    skewX: 0,
                    ease: Expo.easeOut
                })
                TweenMax.to([this.outerEarL, this.outerEarR, this.earHairL, this.earHairR, this.hair], 1, {
                    x: 0,
                    y: 0,
                    scaleY: 1,
                    ease: Expo.easeOut
                })
            },
            /**
             * @description 获取元素的位置
             */
            getPosition (el) {
                var xPos = 0
                var yPos = 0

                while (el) {
                    if (el.tagName === 'BODY') {
                        // deal with browser quirks with body/window/document and page scroll
                        var xScroll = el.scrollLeft || document.documentElement.scrollLeft
                        var yScroll = el.scrollTop || document.documentElement.scrollTop

                        xPos += (el.offsetLeft - xScroll + el.clientLeft)
                        yPos += (el.offsetTop - yScroll + el.clientTop)
                    } else {
                        // for all other non-BODY elements
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft)
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop)
                    }

                    el = el.offsetParent
                }

                return {
                    x: xPos,
                    y: yPos
                }
            },
            getRandomInt (max) {
                return Math.floor(Math.random() * Math.floor(max))
            },
            startBlinking (delay) {
                const vm = this
                if (delay) {
                    delay = this.getRandomInt(delay)
                } else {
                    delay = 1
                }
                TweenMax.to([this.eyeL, this.eyeR], 0.1,
                    {
                        delay: delay,
                        scaleY: 0,
                        yoyo: true,
                        repeat: 1,
                        transformOrigin: 'center center',
                        onComplete: function () {
                            vm.startBlinking(12)
                        }
                    }
                )
            },
            getAngle (x1, y1, x2, y2) {
                var angle = Math.atan2(y1 - y2, x1 - x2)
                return angle
            },
            /**
             * @description 初始化
             */
            initLoginForm () {
                let mySVG = document.querySelector('.svg-container')
                this.armL = document.querySelector('.armL')
                this.armR = document.querySelector('.armR')
                this.eyeL = document.querySelector('.eyeL')
                this.eyeR = document.querySelector('.eyeR')
                this.nose = document.querySelector('.nose')
                this.mouth = document.querySelector('.mouth')
                this.userName = document.querySelector('#loginUser')
                this.password = document.querySelector('#loginPassword')
                this.chin = document.querySelector('.chin')
                this.face = document.querySelector('.face')
                this.eyebrow = document.querySelector('.eyebrow')
                this.outerEarL = document.querySelector('.earL .outerEar')
                this.outerEarR = document.querySelector('.earR .outerEar')
                this.earHairL = document.querySelector('.earL .earHair')
                this.earHairR = document.querySelector('.earR .earHair')
                this.hair = document.querySelector('.hair')
                this.bodyBG = document.querySelector('.bodyBGnormal')

                // some measurements for the svg's elements
                let svgCoords = this.getPosition(mySVG)
                this.userNameCoords = this.getPosition(this.userName)
                this.screenCenter = svgCoords.x + (mySVG.offsetWidth / 2)
                this.eyeLCoords = {x: svgCoords.x + 84, y: svgCoords.y + 76}
                this.eyeRCoords = {x: svgCoords.x + 113, y: svgCoords.y + 76}
                this.noseCoords = {x: svgCoords.x + 97, y: svgCoords.y + 81}
                this.mouthCoords = {x: svgCoords.x + 100, y: svgCoords.y + 100}

                // move arms to initial positions
                TweenMax.set(this.armL, {
                    x: -93,
                    y: 220,
                    rotation: 105,
                    transformOrigin: 'top left'
                })
                TweenMax.set(this.armR, {
                    x: -93,
                    y: 220,
                    rotation: -105,
                    transformOrigin: 'top right'
                })

                //activate blinking
                this.startBlinking(5)

                // determine how far userName input can go before scrolling occurs
                // will be used as the furthest point avatar will look to the right
                this.userNameScrollMax = this.userName.scrollWidth
                // clear the console
                console.clear()
            },
            /**
             * @description 计算脸部移动
             */
            calculateFaceMove () {
                let eyeLX = null
                let eyeLY = null
                let eyeRX = null
                let eyeRY = null
                let noseX = null
                let noseY = null
                let mouthAngle = null
                let mouthX = null
                let mouthY = null
                let mouthR = null
                let chinX = null
                let chinY = null
                let chinS = null
                let faceX = null
                let faceY = null
                let faceSkew = null
                let eyebrowSkew = null
                let outerEarX = null
                let outerEarY = null
                let hairX = null
                let hairS = null
                let eyeLAngle = null
                let eyeRAngle = null
                let noseAngle = null
                let dFromC = null

                let carPos = this.userName.selectionEnd
                let div = document.createElement('div')
                let span = document.createElement('span')
                let copyStyle = getComputedStyle(this.userName)
                let caretCoords = {}
                if (carPos === null || carPos === 0) {
                    // if browser doesn't support 'selectionEnd' property on input[type='userName'], use 'value.length' property instead
                    carPos = this.userName.value.length
                }
                [].forEach.call(copyStyle, function (prop) {
                    div.style[prop] = copyStyle[prop]
                })
                div.style.position = 'absolute'
                document.body.appendChild(div)
                div.textContent = this.userName.value.substr(0, carPos)
                span.textContent = this.userName.value.substr(carPos) || '.'
                div.appendChild(span)

                if (this.userName.scrollWidth <= this.userNameScrollMax) {
                    caretCoords = this.getPosition(span)
                    dFromC = this.screenCenter - (caretCoords.x + this.userNameCoords.x)
                    eyeLAngle = this.getAngle(this.eyeLCoords.x, this.eyeLCoords.y, this.userNameCoords.x + caretCoords.x, this.userNameCoords.y + 25)
                    eyeRAngle = this.getAngle(this.eyeRCoords.x, this.eyeRCoords.y, this.userNameCoords.x + caretCoords.x, this.userNameCoords.y + 25)
                    noseAngle = this.getAngle(this.noseCoords.x, this.noseCoords.y, this.userNameCoords.x + caretCoords.x, this.userNameCoords.y + 25)
                    mouthAngle = this.getAngle(this.mouthCoords.x, this.mouthCoords.y, this.userNameCoords.x + caretCoords.x, this.userNameCoords.y + 25)
                } else {
                    eyeLAngle = this.getAngle(this.eyeLCoords.x, this.eyeLCoords.y, this.userNameCoords.x + this.userNameScrollMax, this.userNameCoords.y + 25)
                    eyeRAngle = this.getAngle(this.eyeRCoords.x, this.eyeRCoords.y, this.userNameCoords.x + this.userNameScrollMax, this.userNameCoords.y + 25)
                    noseAngle = this.getAngle(this.noseCoords.x, this.noseCoords.y, this.userNameCoords.x + this.userNameScrollMax, this.userNameCoords.y + 25)
                    mouthAngle = this.getAngle(this.mouthCoords.x, this.mouthCoords.y, this.userNameCoords.x + this.userNameScrollMax, this.userNameCoords.y + 25)
                }

                eyeLX = Math.cos(eyeLAngle) * 20
                eyeLY = Math.sin(eyeLAngle) * 10
                eyeRX = Math.cos(eyeRAngle) * 20
                eyeRY = Math.sin(eyeRAngle) * 10
                noseX = Math.cos(noseAngle) * 23
                noseY = Math.sin(noseAngle) * 10
                mouthX = Math.cos(mouthAngle) * 23
                mouthY = Math.sin(mouthAngle) * 10
                mouthR = Math.cos(mouthAngle) * 6
                chinX = mouthX * 0.8
                chinY = mouthY * 0.5
                chinS = 1 - ((dFromC * 0.15) / 100)
                let chinMin = 0.5
                if (chinS > 1) {
                    chinS = 1 - (chinS - 1)
                    if (chinS < chinMin) {
                        chinS = chinMin
                    }
                }
                faceX = mouthX * 0.3
                faceY = mouthY * 0.4
                faceSkew = Math.cos(mouthAngle) * 5
                eyebrowSkew = Math.cos(mouthAngle) * 25
                outerEarX = Math.cos(mouthAngle) * 4
                outerEarY = Math.cos(mouthAngle) * 5
                hairX = Math.cos(mouthAngle) * 6
                hairS = 1.2

                TweenMax.to(this.eyeL, 1, {
                    x: -eyeLX,
                    y: -eyeLY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.eyeR, 1, {
                    x: -eyeRX,
                    y: -eyeRY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.nose, 1, {
                    x: -noseX,
                    y: -noseY,
                    rotation: mouthR,
                    transformOrigin: 'center center',
                    ease: Expo.easeOut
                })
                TweenMax.to(this.mouth, 1, {
                    x: -mouthX,
                    y: -mouthY,
                    rotation: mouthR,
                    transformOrigin: 'center center',
                    ease: Expo.easeOut
                })
                TweenMax.to(this.chin, 1, {
                    x: -chinX,
                    y: -chinY,
                    scaleY: chinS,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.face, 1, {
                    x: -faceX,
                    y: -faceY,
                    skewX: -faceSkew,
                    transformOrigin: 'center top',
                    ease: Expo.easeOut
                })
                TweenMax.to(this.eyebrow, 1, {
                    x: -faceX,
                    y: -faceY,
                    skewX: -eyebrowSkew,
                    transformOrigin: 'center top',
                    ease: Expo.easeOut
                })
                TweenMax.to(this.outerEarL, 1, {
                    x: outerEarX,
                    y: -outerEarY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.outerEarR, 1, {
                    x: outerEarX,
                    y: outerEarY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.earHairL, 1, {
                    x: -outerEarX,
                    y: -outerEarY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.earHairR, 1, {
                    x: -outerEarX,
                    y: outerEarY,
                    ease: Expo.easeOut
                })
                TweenMax.to(this.hair, 1, {
                    x: hairX,
                    scaleY: hairS,
                    transformOrigin: 'center bottom',
                    ease: Expo.easeOut
                })

                document.body.removeChild(div)
            },
            changePlainpasswd (ev, flag) {
                // this.activeElement = 'toggle'
                this.plainText = !this.plainText
                // if (!this.eyesCovered) {
                //     this.coverEyes()
                // }
                // if (this.plainText) {
                //     this.spreadFingers()
                // } else {
                //     this.closeFingers()
                // }
            },
            onPasswdToggleBlur () {
                console.log('blur')
            },
            ...mapActions([
                'setIsDefaultPassword',
                'setCheckoutProject',
                'clearLicenseInterval',
                'setDomainList'
            ])
        },
        created () {
            // UCMP3-6518-修改新用户的密码，退出修改用户页面后，点击注册，报“会话超时
            this.setIsDefaultPassword(false)
            this.clearLicenseInterval()
            this.clearStorage()
            LoginApi.getDomainList().then(res => {
                this.domains = res.domains.map(item => {
                    return {
                        id: item.id,
                        name: item.id === 'default' ? '本地' : item.name
                    }
                })
                this.setDomainList(this.domains)
                // 默认选中第一条数据
                this.loginForm.domain_id = this.domains.length ? this.domains[0].id : 'default'
            })
        },
        mounted () {
            // this.initLoginForm()
        }
    }
</script>
<style lang='scss' scoped>
    .login-title {
        margin: 35px 0;

        span {
            color: white;
            font-size: 30px;
        }
    }
</style>

<style lang="css">
    /* IE 下去除password小眼睛 */
    input::-ms-reveal {
      display: none;
    }
</style>
