<template lang="pug">
    el-tooltip(:content="text" effect="light")
        i.theme-color(@click="handleClick" :class="[isPortal ? 'portal-icon-button' : 'icon-button', type]")
</template>
<script>
    export default {
        props: ['args', 'type', 'text', 'disable'],
        data () {
            return {}
        },
        methods: {
            handleClick () {
                if (!this.disable) {
                    this.$emit('iconClick', this.args)
                }
            }
        },
        computed: {
            isPortal () {
                return this.type.indexOf('portal') !== -1
            }
        },
        created () {
            this.type = this.type ? this.type : 'portal-icon-dict'
            this.args = this.args ? this.args : ''
            this.text = this.text ? this.text : ''
        }
    }
</script>
<style lang="scss" scoped>
    .portal-icon-button {
        font-family: 'iconfont-portal' !important;
        font-size: 16px;
        color: #409EFF;
        cursor: pointer;
        margin-right: 10px;
    }

    .icon-button {
        font-size: 16px;
        margin-right: 10px;
        color: #409EFF;
        cursor: pointer;
    }
</style>
