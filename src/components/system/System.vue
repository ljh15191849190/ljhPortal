<template lang="pug">
    div.portal-part.full-content
        div.left-part
            div.collapse-switch(type="primary" :icon="collapseIcon" size="small" :class="{'btn-mini-width': isCollapse}")
                i.portal-icon-menu.collapse-btn(@click="toggleCollapse")
            Navbar.full-content(:is-collapse="isCollapse" :class="{'no-width': isCollapse}")
        div.right-part(:class="{'more-width': isCollapse}")
            transition(name="el-fade-in-linear")
                router-view.main-content.full-content
</template>
<script>
    import Navbar from '@/components/system/Navbar'
    import MenuApi from '@api/axios.menu'
    import {mapActions} from 'vuex'
    /**
     * portal 主面板
     */
    export default {
        data () {
            return {
                isCollapse: false
            }
        },
        methods: {
            toggleCollapse () {
                this.isCollapse = !this.isCollapse
            },
            ...mapActions([
                'setBusinessOrproject'
            ]),
            businessOrproject () {
                MenuApi.businessOrproject().then(res => {
                    if (res) {
                        this.setBusinessOrproject(res.choose_name)
                    }
                })
            }
        },
        computed: {
            collapseIcon () {
                return this.isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left'
            }
        },
        created () {
            this.businessOrproject()
        },
        components: {
            Navbar
        }
    }
</script>
<style lang="scss" scoped>
    // 展开按钮样式
    .collapse-switch {
        width: $menuLargeWidth;
        height: $menuHeight;
        background: $menuItemBgColor;
        color: $navBarColor;
        border-bottom: 1px solid $menuBgColor;
        .collapse-btn {
            cursor: pointer;
            position: absolute;
            right: 10px;
            top: 6px;
            // width: 16px;
            // height: 16px;
            font-size: 18px;
            vertical-align: middle;
            display: inline-block;
            width: 24px;
        }
        &.btn-mini-width {
            width: $menuSmallWidth;
            text-align: center;
            .collapse-btn {
                position: relative;
                top: 10px;
                right: 0;
                transform: rotate(90deg);
            }
        }
    }

    // 收起导航时右侧区域的宽度
    .more-width {
        margin-left: $menuSmallWidth;
        width: calc(100% - #{$menuSmallWidth});
    }
</style>
