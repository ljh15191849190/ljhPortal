<template lang="pug">
    el-dropdown.side-icon-function.message-dropdown-container.message-box(:hide-timeout="250")
        el-badge(:hidden="!countDisplay" :value="countDisplay" class="item")
            div.portal-icon-message
        el-dropdown-menu.message-dropdown(slot="dropdown")
            p.message-text 站内消息通知
            ul.message-frame
                li.msgs-list-item(v-for="item in notReadNotice" :key="item.id" @click="goDetail(item)")
                    p
                        span.msg-type {{formatType(item.notice_type)}}
                        span.msg-date {{item.create_at | formatDate}}
                    p
                        span.msg-title {{item.title}}
                li.msg-alert(v-if="notReadNotice.length === 20")
                    span 仅展示近20条消息，更多消息请进入站内消息查看
            div.more-message
                a.ucmp-icon-more(@click="toMessageCenter") 进入站内消息列表
</template>
<script>
    /**
     * @description 侧栏消息通知组件
     * @author xinghua.wen
     */
    import api from '@api/axios.notice'
    import Utils from '@server/utils'
    import noticeType from '@mock/notice/notice_type'
    import {mapGetters, mapActions} from 'vuex'
    import {MESSAGE_TIMEOUT} from '@mock/notice/messageConf'

    export default {
        data () {
            return {
                noticeType: noticeType,
                hasNewNotice: true,
                messageTimer: null
            }
        },
        computed: {
            countDisplay () {
                return this.notReadNoticeCount > 99 ? '99+' : this.notReadNoticeCount
            },
            ...mapGetters([
                'notReadNotice',
                'notReadNoticeCount'
            ])
        },
        methods: {
            toMessageCenter () {
                this.$router.push('/content/message')
            },
            goDetail (notice) {
                this.setSelectedNotice(notice)
                this.$router.push('/content/message/detail')
            },
            getNotReadList () {
                api.getNotReadList().then(res => {
                    this.setNotReadNotice(res.notice_list)
                    this.setNotReadNoticeCount(res.not_read_count)
                })
            },
            /**
             * 格式化 消息类型展示
             * @param type 消息类型key
             * @returns {string} 消息类型
             */
            formatType (type) {
                return this.noticeType[type] || ''
            },
            close () {

            },
            ...mapActions([
                'setSelectedNotice',
                'setNotReadNotice',
                'setNotReadNoticeCount'
            ])
        },
        created () {
            this.getNotReadList()
            this.messageTimer = setInterval(() => {
                this.getNotReadList()
            }, MESSAGE_TIMEOUT)
        },
        beforeDestroy () {
            clearInterval(this.messageTimer)
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
    .message {
        width: 30px;
    }

    .ucmp-icon-more {
        cursor: pointer;
        &:before {
            margin-right: 10px;
        }
    }

    .portal-icon-close {
        cursor: pointer;
        font-size: 13px;
        float: right;
        margin-right: 16px;

        &::after {
            content: ' ';
            display: inline-block;
            clear: both;
        }
    }

    .portal-icon-message {
        font-size: 22px;
    }

    .message-dropdown {
        width: 360px;
        height: 480px;
        font-size: 14px;
        color: $descColor;
        text-align: left;
        list-style: none;
        background-color: $whiteColor;
        -webkit-background-clip: padding-box;
        background-clip: padding-box;
        border-radius: 4px;
        padding: 0;
        & > .message-text {
            padding-left: 16px;
            line-height: 40px;
            background: $normalBgColor;
            color: $contentColor;
        }
        & > .message-frame {
            height: 400px;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0 8px 0 16px !important;

            & > .msg-alert {
                font-size: 12px;
                color: $infoColor;
                text-align: center;
                padding: 12px 0;
            }

            & > .msgs-list-item {
                cursor: pointer;
                overflow: hidden;
                border-bottom: 1px solid $lighterBorderColor;

                p {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }

                p:first-child {
                    padding-top: 9px;
                    padding-bottom: 6px;
                }

                p:last-child {
                    padding-bottom: 6px;
                }

                .msg-type {
                    font-size: 14px;
                    font-weight: 500;
                    color: $descColor;
                }

                .msg-date {
                    font-size: 12px;
                    color: $infoColor;
                }

                .msg-title {
                    font-size: 14px;
                    color: $infoColor;
                }

                &:last-child {
                    border-bottom: 0;
                }
            }
        }
        .more-message {
            height: 40px;
            text-align: center;
            display: block;
            line-height: 40px;
            color: $themeColor;
            border-top: 1px solid $lighterBorderColor;
        }
    }
</style>
<style lang="scss">
    .message-box {
        .el-badge__content.is-fixed {
            top: 2px;
            border: none;
        }
    }
</style>
