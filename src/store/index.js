import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import system from './modules/system'
import user from './modules/user'
import notice from './modules/notice'
import business from './modules/business'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        system,
        user,
        notice,
        business
    },
    strict: debug
})
