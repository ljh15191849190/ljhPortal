<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal")
        div
            el-row
                label.search-label 登录名(姓名)
                el-select.input-type(
                    v-model="queryWordData"
                    placeholder="请输入登录名/姓名搜索"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    value-key="user_id"
                    :loading="userLoading"
                    :remote-method="remoteUserList"
                    size="small")
                        el-option(v-for="item in userList" :key="item.user_id" :label="item.username" :value="item")
                            span {{item.username}}
                            span(v-if="item.realname") ({{item.realname}})
        div.dialog-footer(slot="footer")
            el-button(size="mini" @click="closeModal") 取消
            el-button(size="mini" @click="save" type="primary" :loading="isSaving") 保存
</template>

<script>
/**
 * @description 修改/新增 业务
 */
import BusinessApi from '@api/axios.business'
import UserApi from '@api/axios.users'
import { mapGetters } from 'vuex'
export default {
    name: 'BusinessUser',
    props: ['data', 'visible', 'type'],
    data () {
        return {
            isSaving: false,
            userLoading: false,
            queryWordData: [],
            userList: []
        }
    },
    computed: {
        title () {
            return this.type === 'app' ? '绑定应用负责人' : `绑定${this.IsBussiness}负责人`
        },
        IsBussiness () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },
        ...mapGetters(['businessOrproject'])
    },
    methods: {
        // 用户
        remoteUserList (query) {
            if (query !== '') {
                this.userLoading = true
                let param = {
                    page_idx: 1,
                    limit: 99999,
                    name: query
                }
                UserApi.getUserListWithPagination(param).then(res => {
                    this.userLoading = false
                    // res.users.forEach(item => {
                    //     item.username = item.name
                    //     item.user_id = item.id
                    // })
                    // this.userList=res.users
                    let arr = res.users.map(
                        item => {
                            return {
                                user_id: item.id,
                                username: item.name,
                                realname: item.realname,
                                org_name: item.org_name
                            }
                        }
                    )
                    this.userList = this.getObjArrEqual([...arr, ...this.queryWordData], 'user_id')
                })
            } else {
                this.userList = []
            }
        },
        getObjArrEqual (arr, u_key) {
            let map = new Map()
            arr.forEach((item, index) => {
                if (!map.has(item[u_key])) {
                    map.set(item[u_key], item)
                }
            })
            return [...map.values()]
        },
        //查询业务项目
        getqueryList (raw) {
            let param = {
                business_id: raw
            }
            BusinessApi.getbussinessUser(param).then(res => {
                if (res.users_info) {
                    this.queryWordData = res.users_info
                    this.userList = res.users_info
                }
            })
        },
        // 查询app
        getqueryappList (data) {
            let param = {
                app_id: data
            }
            BusinessApi.getAppUser(param).then(res => {
                if (res.users_info) {
                    this.queryWordData = res.users_info
                    // 编辑初始化显示
                    this.userList = res.users_info
                }
            })
        },
        /**
         * @description 关闭模态框
         * */
        closeModal () {
            this.$emit('closeuserDialog')
        },
        /**
         * @description 保存
         */
        save () {
            this.isSaving = true
            let user_ids = []
            this.queryWordData.forEach(item => {
                user_ids.push(item.user_id)
            })
            if (this.type === 'app') {
                let payload = {
                    user_ids: user_ids,
                    app_id: this.data.id
                }
                BusinessApi.bindAppUser(payload).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '绑定成功'
                    })
                    this.isSaving = false
                    this.$emit('updateUser')
                }).catch(e => {
                    this.isSaving = false
                })
            } else {
                let payload = {
                    user_ids: user_ids,
                    business_id: this.data.id
                }
                BusinessApi.bindBussinessUser(payload).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '绑定成功'
                    })

                    this.isSaving = false
                    this.$emit('updateUser')
                }).catch(e => {
                    this.isSaving = false
                })
            }
        }
    },
    created () {
        if (this.type === 'app') {
            this.getqueryappList(this.data.id)
        } else {
            this.getqueryList(this.data.id)
        }
    }
}
</script>

<style lang="scss" scoped>

.input-type{
    width: 75% !important;
    margin: 0 20px 0 10px;
}
</style>
