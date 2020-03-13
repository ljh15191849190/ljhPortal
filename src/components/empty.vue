<template lang="pug">
    div
        div.empty-content
            span.empty-txt 您的账户未授权， 无访问权限， 请联系管理员!
</template>
<script>
    export default {
        name: 'empty'
    }
</script>
<style lang="scss" scoped>
    .main-content {
        padding-top: 16px;
    }

    .empty-content {
        margin: 0px 16px;
        padding: 16px;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        .empty-txt {
            font-size: 18px;
            color: #f86255
        }
    }
</style>
