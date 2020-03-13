<template lang="pug">
    div.portal-non-left-nav.message-center
        div.title.flex-between
            span
                span 站内消息
                <!-- UCMP-694 站内消息，点击返回，没有跳转到进入站内消息之前的页面，左侧会多出服务目录菜单, 暂时隐藏 -->
                el-button.back(type="info" plain size="mini" icon="portal-icon-back" @click="back") 返回
            span(v-if="canPublishMsg")
                el-button(type="primary" size="small" @click="goPublishNotice") 发布消息
        div.content.message-center.overflow-y-auto
            div.message-menu
                el-radio-group(v-model="filterType" @change="changeFilter" size="small")
                    el-radio-button(v-for="(item, index) in noticeType" :key="index" :label="index") {{item}}
                div.has-new-msg(@click="getNoticeList(1)")
                    el-alert(v-show="hasNewNotice" title="您有新的通知，请点击刷新" type="success" :closable="false")
            el-table(:data="tableData" size="small" stripe @selection-change="handleSelectionChange")
                el-table-column(type="selection")
                el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" show-overflow-tooltip)
                    template(slot-scope="scope")
                        <!-- 未读 红点 -->
                        el-badge(v-if="column.link" :is-dot="!scope.row.is_read")
                            el-button(type="text" size="small" @click="toNoticeDeatil(scope.row)") {{scope.row[column.prop]}}
                        span(v-else-if="column.format") {{column.format(scope.row[column.prop])}}
                        span(v-else) {{scope.row[column.prop]}}

            el-row.msg-footer(type="flex" justify="space-between")
                div
                    el-button(size="small" @click="deleteMsg" :disabled="!ids.length") 删除
                    el-button(size="small" type="primary" plain @click="readMsg" :disabled="!ids.length") 标记为已读
                el-pagination(
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="pagination.index"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.size"
                layout="sizes, total, prev, pager, next"
                :page-count="pagination.count"
                :total="pagination.total")
</template>
<script>
    /**
     * @description 站内消息
     */
    import api from '@api/axios.notice'
    import Utils from '@server/utils'
    import roleApi from '@api/axios.role'
    import noticeType from '@mock/notice/notice_type'
    import {mapActions} from 'vuex'
    import {MESSAGE_TIMEOUT} from '@mock/notice/messageConf'

    export default {
        name: 'Message',
        data () {
            return {
                ids: [],
                filterType: 0,
                noticeType: noticeType,
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                tableData: [],
                roles: {},
                messageTimer: null,
                hasNewNotice: false,
                userId: localStorage.getItem('userId')
            }
        },
        computed: {
            columns () {
                return [
                    {
                        prop: 'title',
                        label: '标题',
                        link: true
                    },
                    {
                        prop: 'notice_type',
                        label: '类型',
                        format: this.formatType
                    },
                    {
                        prop: 'contentShowList',
                        label: '内容',
                        format: this.formatCot
                    },
                    {
                        prop: 'create_at',
                        label: '发布时间',
                        format: this.formatDate
                    }
                ]
            },
            canPublishMsg () {
                // system_root 代表可以发布消息
                return this.roles.system && this.roles.system.role_data === 'system_root'
            }
        },
        methods: {
            back () {
                let product = sessionStorage.getItem('portal-route-navbar')
                let beforeMessageCenter = sessionStorage.getItem('before-message-center')

                // 其他产品 创建的时候会回到上一次访问的路由
                if (product !== 'system') this.$router.push('/content/product/' + product)
                // 系统管理下的需要记忆的路由跳转
                else this.$router.push(beforeMessageCenter)
            },
            handleSelectionChange (val) {
                this.ids = val.map(item => item.notice_id)
            },
            handleSizeChange (val) {
                this.pagination.index = 1
                this.pagination.size = val
                this.getNoticeList()
            },
            handleCurrentChange () {
                this.getNoticeList()
            },
            /**
             * @description 进入消息详情
             */
            toNoticeDeatil (data) {
                this.setSelectedNotice(data)
                this.$router.push('/content/message/detail/')
            },
            changeFilter () {
                this.pagination.index = 1
                this.getNoticeList()
            },
            /**
             * @description 获取所有消息列表
             * @param page 传入需要跳转的页
             */
            getNoticeList (page) {
                //
                clearInterval(this.messageTimer)

                // 调用触发
                if (page) this.pagination.index = page
                api.getNoticeList(this.pagination, this.filterType || '').then(res => {
                    this.tableData = res.notices.map(item => {
                        // UCMP3-5582 站内消息列表页面，消息内容申请单号的链接将html语句也显示出来了
                        item.contentShowList = item.content.replace(/\<a([^\>]*)\>(.*)\<\/a\>/g, '$2')
                        return item
                    })
                    this.pagination.count = res.page_count || 1
                    this.pagination.total = res.total || 0
                })

                // 轮询
                this.hasNewNotice = false
                this.messageTimer = setInterval(() => {
                    this.getNewNotice()
                }, MESSAGE_TIMEOUT)
            },
            /**
             * 获取并比对是否有新消息
             */
            getNewNotice () {
                api.getNoticeList(this.pagination, this.filterType).then(res => {
                    const newList = res.notices
                    if (newList.length > 0 && this.tableData.length > 0) {
                        // 判断首项不同既存在新消息
                        this.hasNewNotice = (newList[0].id !== this.tableData[0].id)
                    }
                })
            },
            /**
             * @description 删除消息操作
             */
            deleteMsg () {
                api.deleteNotice({notice_ids: this.ids}).then(() => {
                    this.$notify({
                        type: 'success',
                        message: '消息已成功删除'
                    })

                    // UCMP3-1540【站内消息】在站内消息列表，删除最后一页的数据，页面显示暂无数据，应跳转到第一页
                    // 删除了本页所有的数据，跳至前一页
                    if (this.pagination.index === this.pagination.count && this.ids.length === this.tableData.length) {
                        let preIndex = this.pagination.index - 1 || 1
                        this.getNoticeList(preIndex)
                    } else this.getNoticeList()
                })
            },
            /**
             * @description 点击进来即已读
             */
            readMsg () {
                api.readNotice({notice_ids: this.ids}).then(() => {
                    this.$notify({
                        type: 'success',
                        message: '消息已读'
                    })

                    this.getNoticeList()
                })
            },
            goPublishNotice () {
                this.$router.push('/content/message/publish')
            },
            getUserRole () {
                roleApi.getRoleDetailByUser(this.userId).then(res => {
                    this.roles = res
                })
            },
            formatType (type) {
                return this.noticeType[type] || ''
            },
            // 对消息的内容进行处理，截取table标签之前的文本内容
            formatCot (cot) {
                return cot.split('<table')[0]
            },
            formatDate (timestamp) {
                if (timestamp.toString().length === 10) {
                    timestamp *= 1000
                }
                return Utils.formatDate(new Date(timestamp))
            },
            ...mapActions([
                'setSelectedNotice'
            ])
        },
        created () {
            this.getNoticeList()
            this.getUserRole()
        },
        beforeDestroy () {
            clearInterval(this.messageTimer)
        }
    }
</script>
<style lang="scss" scoped>
    .back {
        margin-left: 12px;
        padding: 6px 20px;
    }

    .message-center {

    }

    .message-center.content {
        padding: 16px;

        .active {
            border: 1px solid $lighterBorderColor;
        }

        .msg-footer {
            padding-top: 16px;
        }

        .msg-type {
            display: inline-block;
            padding: 6px 12px;
            margin-bottom: 0;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.42857143;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -ms-touch-action: manipulation;
            touch-action: manipulation;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            background-image: none;
            border: 1px solid transparent;
            border-radius: 4px;
            margin-right: 5px;
            &:hover {
                border: 1px solid $lighterBorderColor;
            }
        }

        .el-table {
            height: calc(100% - 40px - 51px);
        }
    }

    .flex-between {
        display: flex;
        justify-content: space-between;
    }

    .table-content {
        height: 100%;
    }

    .table-row {
        height: calc(100% - 56px - 64px);
    }
</style>
<style lang="scss">
    .message-center {
        .el-badge__content {
            top: 5px;
        }
    }

    .message-menu {
        display: flex;
        justify-content: space-between;

        .has-new-msg {
            cursor: pointer;
        }
    }
</style>
