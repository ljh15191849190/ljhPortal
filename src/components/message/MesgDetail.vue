<template lang="pug">
    div.portal-non-left-nav.msg
        div.title
            span.previous(@click="back") 站内消息
            i.portal-icon-circle
            span 消息详情
        div.content
            div.operate-btns
                el-button.operator-icon-btn(type="info" size="small" icon="portal-icon-back" @click="back")
                el-button.operator-icon-btn(type="info" size="small" icon="portal-icon-delete" @click="deleteMsg")
            el-row(type="flex" justify="center")
                span.msg-title.content-color {{selectedNotice.title}}
            el-row(type="flex" justify="center")
                span.msg-date.desc-color {{selectedNotice.create_at | formatDate}}
            el-row.msg-detail.content-color
                div.cot-container(v-html="selectedNotice.content", @click="handleTagClick($event)")
</template>
<script>
    /**
     * @description 消息详情
     */
    import api from '@api/axios.notice'
    import Utils from '@server/utils'
    import {mapGetters, mapActions} from 'vuex'

    export default {
        name: 'MesgDetail',
        data () {
            return {}
        },
        computed: {
            ids () {
                return [this.selectedNotice.notice_id]
            },
            ...mapGetters([
                'selectedNotice'
            ])
        },
        methods: {
            /**
             * @description 删除消息操作
             */
            deleteMsg () {
                api.deleteNotice({notice_ids: this.ids}).then(() => {
                    this.$notify({
                        type: 'success',
                        message: '消息已成功删除'
                    })

                    this.back()
                })
            },
            /**
             * @description 点击进来即已读
             */
            readMsg () {
                api.readNotice({notice_ids: this.ids}).then(() => {
                    api.getNotReadList().then(res => {
                        this.setNotReadNotice(res.notice_list)
                        this.setNotReadNoticeCount(res.not_read_count)
                    })
                })
            },
            /**
            * @description 跳转到对应的路径
            * @params orderType 跳转的类型
            * @params orderId 跳转的订单号
            * @params projectName 项目名称 eg: ucmp
            */
            goIframeOrderDetail (orderType, orderId, projectName, processId, taskId, type) {
                let baseUrl = ''  //跳转基础路径
                // 生产环境 或 测试环境
                if (process.env.NODE_ENV !== 'development') {
                    baseUrl = `/static/${projectName}-ui/index.html`
                // 开发环境
                } else {
                    baseUrl = `http://localhost:8100/`
                }
                let jumpObj = {
                    'order': `#/orders/${orderId}`,
                    'task': `#/taskOrderDetail/${orderId}`,
                    'approve': `#/approveDetail?orderCode=${orderId}&processId=${processId}&taskId=${taskId}&type=${type}`
                }
                // 设置站内消息跳转的路径
                this.setJumpDetailHref(`${baseUrl}${jumpObj[orderType]}`)
                // 先跳转到ucmp的页面 加载出来iframe
                this.$router.push(`/content/product/${projectName}?timestamp=${Date.now()}`)
            },
            back () {
                this.$router.push('/content/message')
            },
            // dom check
            handleTagClick (event) {
                if (['order', 'task', 'approve'].indexOf(event.target.className) > -1) {
                  let orderType = event.target.className
                  let {processid, taskid, type, ordercode} = {...event.target.dataset}
                  console.log(event.target.dataset)
                  this.goIframeOrderDetail(orderType, ordercode, 'ucmp', processid, taskid, type)
                }
            },
            ...mapActions([
                'setNotReadNotice',
                'setNotReadNoticeCount',
                'setJumpDetailHref'
            ])
        },
        created () {
            this.readMsg()
        },
        filters: {
            formatDate (timestamp) {
                if (timestamp.toString().length === 10) {
                    timestamp *= 1000
                }
                return Utils.formatDate(new Date(timestamp))
            }
        }
    }
</script>
<style lang="scss" scoped>
    .previous {
        cursor: pointer;
    }

    .content {
        position: relative;
        padding-top: 50px !important;

        .msg-title {
            font-size: 18px;
            padding-bottom: 18px;
        }

        .msg-date {
            font-size: 12px;
            padding-bottom: 40px;
        }

        .msg-detail {
            // max-width: 1000px;
            padding: 0 10%;
            font-size: 14px;
            height: calc(100% - 120px);
            .cot-container {
                height: 100%;
                overflow-y: auto;
            }
        }

        .operator-icon-btn {
            background: $normalBgColor;
            border-color: $borderColor;
            color: $contentColor;
            &:hover {
                background: $themeColor;
                color: white;
            }
        }

        .operate-btns {
            position: absolute;
            top: 18px;
            right: 25px;
        }
    }

    .portal-icon-circle {
        display: inline-block;
        margin: 0 12px;
        color: #ccc;
    }
</style>

<style lang="scss">
/* 添加cot-container类 不会影响到其他页面*/
.cot-container{
    .order, .task, .approve {
        cursor: pointer;
        color:#007bff!important;
        text-decoration: underline!important;
    }
}
</style>

