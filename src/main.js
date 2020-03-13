// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/iconfont.css'
import './assets/scss/portal.scss'
import './assets/assets.css'

import Vue from 'vue'
import ElementUI from 'element-ui'
import store from './store'
import router from './router'
import axiosConfig from '@/api/axios.config'
import './browserSupport'
import App from './App'
import { Btnprivilege, Tabactive } from '@leaptocloud/standard-ui'

// localStorage.setItem('browserSupport', detectBrowserVersion())
if (localStorage.getItem('browserSupport') !== 'false') {
    Vue.config.productionTip = false
    axiosConfig()
    Vue.use(ElementUI).use(Btnprivilege.directive)
    Vue.use(ElementUI).use(Tabactive.directive)
    /* eslint-disable no-new */
    new Vue({
        el: '#portal',
        router,
        store,
        template: '<App/>',
        components: {App}
    })
}
